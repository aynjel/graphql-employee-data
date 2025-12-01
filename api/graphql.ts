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

function getServer(): ApolloServer<GraphQLContext> {
	if (!server) {
		server = new ApolloServer<GraphQLContext>({
			typeDefs,
			resolvers: resolvers as any,
			introspection: true,
			plugins: [ApolloServerPluginLandingPageLocalDefault({ embed: true })],
		});
	}
	return server;
}

// Vercel serverless function handler
export default async function handler(req: Request): Promise<Response> {
	const apolloServer = getServer();

	// Handle GET requests (for GraphQL Playground and URL queries)
	if (req.method === 'GET') {
		const url = new URL(req.url);
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
									endpoint: '${req.url}',
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
		const body = (await req.json()) as {
			query: string;
			variables?: Record<string, any>;
			operationName?: string;
		};
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
}
