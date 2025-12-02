import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

export const generateToken = (user) => {
	return jwt.sign(
		{
			id: user.id,
			username: user.username,
			role: user.role,
		},
		JWT_SECRET,
		{ expiresIn: '24h' }
	);
};

export const verifyToken = (token) => {
	try {
		return jwt.verify(token, JWT_SECRET);
	} catch (error) {
		return null;
	}
};

export const getTokenFromRequest = (req) => {
	const authHeader = req.headers.authorization;
	if (authHeader && authHeader.startsWith('Bearer ')) {
		return authHeader.substring(7);
	}
	return null;
};
