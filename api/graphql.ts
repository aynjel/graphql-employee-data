import { ApolloServer } from '@apollo/server';
import { ApolloServerPluginLandingPageLocalDefault } from '@apollo/server/plugin/landingPage/default';
import { resolvers } from '../schema/resolvers.js';
import { typeDefs } from '../schema/typeDefs.js';
import type { GraphQLContext } from '../types/index.js';
import { authUtils } from '../utils/auth.js';

// Vercel request/response types
type VercelRequest = {
	method?: string;
	url?: string;
	headers: Record<string, string | string[] | undefined>;
	body?: any;
	query?: Record<string, string | string[]>;
};

type VercelResponse = {
	setHeader: (name: string, value: string) => void;
	status: (code: number) => VercelResponse;
	json: (data: any) => void;
	send: (data: string) => void;
};

// Helper to get headers from request
const getHeader = (req: VercelRequest, name: string): string | null => {
	const header = req.headers[name] || req.headers[name.toLowerCase()];
	return header ? (Array.isArray(header) ? header[0] : header) : null;
};

// Create context function for Vercel
const createContext = async (req: VercelRequest): Promise<GraphQLContext> => {
	const authHeader = getHeader(req, 'authorization');
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

// CORS configuration
const ALLOWED_ORIGINS = process.env.ALLOWED_ORIGINS?.split(',') || ['*'];
const ALLOWED_METHODS = ['GET', 'POST', 'OPTIONS'];
const ALLOWED_HEADERS = ['Content-Type', 'Authorization'];

// Helper function to set CORS headers
const setCORSHeaders = (req: VercelRequest, res: VercelResponse) => {
	const origin = getHeader(req, 'origin');

	// Determine allowed origin
	let allowedOrigin = '*';
	if (origin && ALLOWED_ORIGINS.includes('*')) {
		allowedOrigin = '*';
	} else if (origin && ALLOWED_ORIGINS.includes(origin)) {
		allowedOrigin = origin;
	} else if (ALLOWED_ORIGINS.length === 1 && ALLOWED_ORIGINS[0] !== '*') {
		allowedOrigin = ALLOWED_ORIGINS[0];
	}

	res.setHeader('Access-Control-Allow-Origin', allowedOrigin);
	res.setHeader('Access-Control-Allow-Methods', ALLOWED_METHODS.join(', '));
	res.setHeader('Access-Control-Allow-Headers', ALLOWED_HEADERS.join(', '));
	res.setHeader('Access-Control-Allow-Credentials', 'true');
	res.setHeader('Access-Control-Max-Age', '86400'); // 24 hours
};

// Vercel serverless function handler
export default async function handler(req: VercelRequest, res: VercelResponse) {
	// Set CORS headers for all requests
	setCORSHeaders(req, res);

	// Handle OPTIONS request (CORS preflight)
	if (req.method === 'OPTIONS') {
		res.status(200).json({});
		return;
	}

	try {
		const apolloServer = await getServer();

		// Get host from headers
		const host = getHeader(req, 'host') || req.headers.host || 'localhost';
		const protocol = req.headers['x-forwarded-proto'] || 'https';

		// Construct full URL from request
		const urlString = req.url?.startsWith('http')
			? req.url
			: `${protocol}://${host}${req.url || '/api/graphql'}`;
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

				// Extract and return only the GraphQL response data (without wrapper)
				let response: { data: any; errors?: readonly any[] } = { data: null };

				if (result.body && typeof result.body === 'object' && 'kind' in result.body) {
					if (result.body.kind === 'single') {
						response = {
							data: result.body.singleResult?.data || null,
							errors: result.body.singleResult?.errors,
						};
					}
				} else if ('data' in result) {
					// Result has data directly
					response = {
						data: (result as any).data || null,
						errors: (result as any).errors,
					};
				}

				res.setHeader('Content-Type', 'application/json');
				res.status(200).json(response);
				return;
			}

			// Return GraphQL Playground HTML
			res.setHeader('Content-Type', 'text/html');
			res.status(200).send(`
				<!DOCTYPE html>
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
				</html>
			`);
			return;
		}

		// Handle POST requests (standard GraphQL requests)
		if (req.method === 'POST') {
			// Parse request body - Vercel automatically parses JSON bodies
			let body: {
				query: string;
				variables?: Record<string, any>;
				operationName?: string;
			};

			if (req.body) {
				if (typeof req.body === 'string') {
					body = JSON.parse(req.body);
				} else {
					body = req.body as any;
				}
			} else {
				res.status(400).json({ error: 'Request body is required' });
				return;
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

			// Extract and return only the GraphQL response data (without wrapper)
			let response: { data: any; errors?: readonly any[] } = { data: null };

			if (result.body && typeof result.body === 'object' && 'kind' in result.body) {
				if (result.body.kind === 'single') {
					response = {
						data: result.body.singleResult?.data || null,
						errors: result.body.singleResult?.errors,
					};
				}
			} else if ('data' in result) {
				// Result has data directly
				response = {
					data: (result as any).data || null,
					errors: (result as any).errors,
				};
			}

			res.setHeader('Content-Type', 'application/json');
			res.status(200).json(response);
			return;
		}

		// Method not allowed
		res.status(405).json({ error: 'Method not allowed' });
	} catch (error) {
		console.error('GraphQL handler error:', error);
		res.status(500).json({
			error: 'Internal server error',
			message: error instanceof Error ? error.message : 'Unknown error',
		});
	}
}
