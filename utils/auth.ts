import jwt from 'jsonwebtoken';
import type { GraphQLRequest, JwtPayload, UserPayload } from '../types/index.js';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

export const authUtils = {
	generateToken(user: UserPayload): string {
		return jwt.sign(
			{
				id: user.id,
				username: user.username,
				role: user.role,
			},
			JWT_SECRET,
			{ expiresIn: '24h' }
		);
	},

	verifyToken(token: string): JwtPayload | null {
		try {
			return jwt.verify(token, JWT_SECRET) as JwtPayload;
		} catch (error) {
			return null;
		}
	},

	extractToken(req: GraphQLRequest): string | null {
		const authHeader = req.headers.authorization;
		if (authHeader && authHeader.startsWith('Bearer ')) {
			return authHeader.substring(7);
		}
		return null;
	},
};
