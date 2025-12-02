// Simple local server for testing GraphQL API
import http from 'http';
import url from 'url';
import handler from './api/graphql.js';

const PORT = process.env.PORT || 3000;

// Create a simple request/response wrapper for Vercel serverless function format
const server = http.createServer(async (req, res) => {
	// Parse URL
	const parsedUrl = url.parse(req.url, true);

	// Only handle /api/graphql route
	if (parsedUrl.pathname !== '/api/graphql') {
		res.writeHead(404, { 'Content-Type': 'application/json' });
		res.end(JSON.stringify({ error: 'Not Found' }));
		return;
	}

	// Prepare request object in Vercel format
	const vercelReq = {
		method: req.method,
		url: req.url,
		headers: req.headers,
		query: parsedUrl.query,
		body: null,
	};

	// Parse body for POST requests
	if (req.method === 'POST') {
		let body = '';
		req.on('data', (chunk) => {
			body += chunk.toString();
		});
		req.on('end', () => {
			try {
				vercelReq.body = body ? JSON.parse(body) : {};
				handleRequest(vercelReq, res);
			} catch (error) {
				res.writeHead(400, { 'Content-Type': 'application/json' });
				res.end(JSON.stringify({ error: 'Invalid JSON body' }));
			}
		});
	} else {
		handleRequest(vercelReq, res);
	}
});

async function handleRequest(req, res) {
	// Create a response object in Vercel format
	const vercelRes = {
		statusCode: 200,
		headers: {},
		setHeader: (key, value) => {
			vercelRes.headers[key] = value;
		},
		status: (code) => {
			vercelRes.statusCode = code;
			return vercelRes;
		},
		json: (data) => {
			Object.keys(vercelRes.headers).forEach((key) => {
				res.setHeader(key, vercelRes.headers[key]);
			});
			res.writeHead(vercelRes.statusCode, { 'Content-Type': 'application/json' });
			res.end(JSON.stringify(data));
		},
		end: (data) => {
			Object.keys(vercelRes.headers).forEach((key) => {
				res.setHeader(key, vercelRes.headers[key]);
			});
			res.writeHead(vercelRes.statusCode);
			res.end(data);
		},
	};

	try {
		await handler(vercelReq, vercelRes);
	} catch (error) {
		res.writeHead(500, { 'Content-Type': 'application/json' });
		res.end(JSON.stringify({ error: error.message }));
	}
}

server.listen(PORT, () => {
	console.log(`🚀 GraphQL API server running at http://localhost:${PORT}/api/graphql`);
	console.log(`\n📝 Test it with:`);
	console.log(`   curl -X POST http://localhost:${PORT}/api/graphql \\`);
	console.log(`     -H "Content-Type: application/json" \\`);
	console.log(`     -d '{"query": "{ login(username: \\"admin\\", password: \\"admin123\\") { token } }"}'`);
	console.log(`\n🔍 GraphQL Playground: Use any GraphQL client or Postman`);
});
