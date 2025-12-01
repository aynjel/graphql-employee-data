import { ApolloServer, ContextFunction } from '@apollo/server';
import { StandaloneServerContextFunctionArgument, startStandaloneServer } from '@apollo/server/standalone';
import { resolvers } from './schema/resolvers.js';
import { typeDefs } from './schema/typeDefs.js';
import type { GraphQLContext, GraphQLRequest } from './types/index.js';
import { authUtils } from './utils/auth.js';

const context = async ({ req }: { req: GraphQLRequest }): Promise<GraphQLContext> => {
	const token = authUtils.extractToken(req);
	let user = null;

	if (token) {
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

const server = new ApolloServer<GraphQLContext>({
	typeDefs,
	resolvers: resolvers as any,
});

const { url } = await startStandaloneServer(server, {
	listen: { port: 4000 },
	context: context as ContextFunction<[StandaloneServerContextFunctionArgument], GraphQLContext>,
});

console.log(`🚀 Server ready at ${url}`);
console.log(`📚 GraphQL Playground available at ${url}`);
console.log('\n📝 Sample credentials:');
console.log('   Admin: username="admin", password="admin123"');
console.log('   Employee: username="employee", password="emp123"');
console.log('\n💡 Use the Authorization header: Bearer <token>');
