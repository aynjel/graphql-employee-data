import { ApolloServer } from '@apollo/server';
import { ApolloServerPluginLandingPageLocalDefault } from '@apollo/server/plugin/landingPage/default';
import { resolvers } from '../schema/resolvers.js';
import { typeDefs } from '../schema/typeDefs.js';
import type { GraphQLContext } from '../types/index.js';
import { authUtils } from '../utils/auth.js';

// Create context function for Vercel
const createContext = async (req: Request): Promise<GraphQLContext> => {
	const authHeader = req.headers.get('authorization');
	let user = null;

	if (authHeader && authHeader.startsWith('Bearer ')) {
		const token = authHeader.substring(7);
		const decoded = authUtils.verifyToken(token);
		if (decoded) {
			user = {
				id: decoded.id,
				username: decoded.username,
				role: decoded.role,
			};
		}
	}

	return { user };
};

// Create Apollo Server instance (singleton pattern for serverless)
let server: ApolloServer<GraphQLContext> | null = null;
let serverStartPromise: Promise<void> | null = null;

async function getServer(): Promise<ApolloServer<GraphQLContext>> {
	if (!server) {
		server = new ApolloServer<GraphQLContext>({
			typeDefs,
			resolvers: resolvers as any,
			introspection: true,
			plugins: [ApolloServerPluginLandingPageLocalDefault({ embed: true })],
		});
		// Start the server (only once)
		serverStartPromise = server.start();
	}
	// Wait for server to start if it's starting
	if (serverStartPromise) {
		await serverStartPromise;
		serverStartPromise = null; // Clear after first start
	}
	return server;
}

// Vercel serverless function handler
export default async function handler(req: Request): Promise<Response> {
	try {
		const apolloServer = await getServer();

		// Construct full URL from request (Vercel provides relative URLs)
		const urlString = req.url.startsWith('http')
			? req.url
			: `https://${req.headers.get('host') || 'localhost'}${req.url}`;
		const url = new URL(urlString);

		// Handle GET requests (for GraphQL Playground and URL queries)
		if (req.method === 'GET') {
			const query = url.searchParams.get('query');
			const variables = url.searchParams.get('variables');
			const operationName = url.searchParams.get('operationName');

			if (query) {
				// Execute GraphQL query from URL parameters
				const context = await createContext(req);
				const result = await apolloServer.executeOperation(
					{
						query,
						variables: variables ? JSON.parse(variables) : undefined,
						operationName: operationName || undefined,
					},
					{ contextValue: context }
				);

				return new Response(JSON.stringify(result), {
					headers: { 'Content-Type': 'application/json' },
				});
			}

			// Return GraphQL Playground HTML
			return new Response(
				`<!DOCTYPE html>
			<html>
				<head>
					<title>GraphQL Playground</title>
					<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/graphql-playground-react/build/static/css/index.css" />
					<link rel="shortcut icon" href="https://cdn.jsdelivr.net/npm/graphql-playground-react/build/favicon.png" />
					<script src="https://cdn.jsdelivr.net/npm/graphql-playground-react/build/static/js/middleware.js"></script>
				</head>
				<body>
					<div id="root">
						<style>
							body { margin: 0; padding: 0; font-family: Open Sans, sans-serif; overflow: hidden; }
							#root { height: 100vh; }
						</style>
						<script>
							window.addEventListener('load', function (event) {
								GraphQLPlayground.init(document.getElementById('root'), {
									endpoint: '${urlString}',
									settings: {
										'request.credentials': 'same-origin'
									}
								})
							});
						</script>
					</div>
				</body>
			</html>`,
				{
					headers: { 'Content-Type': 'text/html' },
				}
			);
		}

		// Handle POST requests (standard GraphQL requests)
		if (req.method === 'POST') {
			// Parse request body - handle both Web API Request and Vercel format
			let body: {
				query: string;
				variables?: Record<string, any>;
				operationName?: string;
			};

			if (typeof req.json === 'function') {
				body = (await req.json()) as {
					query: string;
					variables?: Record<string, any>;
					operationName?: string;
				};
			} else {
				// Fallback: read body as text and parse JSON
				const text = await req.text();
				body = JSON.parse(text || '{}') as {
					query: string;
					variables?: Record<string, any>;
					operationName?: string;
				};
			}
			const context = await createContext(req);

			const result = await apolloServer.executeOperation(
				{
					query: body.query,
					variables: body.variables,
					operationName: body.operationName,
				},
				{ contextValue: context }
			);

			return new Response(JSON.stringify(result), {
				headers: { 'Content-Type': 'application/json' },
			});
		}

		// Method not allowed
		return new Response('Method not allowed', { status: 405 });
	} catch (error) {
		console.error('GraphQL handler error:', error);
		return new Response(
			JSON.stringify({
				error: 'Internal server error',
				message: error instanceof Error ? error.message : 'Unknown error',
			}),
			{
				status: 500,
				headers: { 'Content-Type': 'application/json' },
			}
		);
	}
}
