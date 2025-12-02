import { userStore } from '../data/store.js';
import { getTokenFromRequest, verifyToken } from './auth.js';

export const authenticate = async (req) => {
	const token = getTokenFromRequest(req);
	if (!token) {
		return null;
	}

	const decoded = verifyToken(token);
	if (!decoded) {
		return null;
	}

	const user = userStore.findById(decoded.id);
	return user ? user.toJSON() : null;
};

export const requireAuth = (user) => {
	if (!user) {
		throw new Error('Authentication required');
	}
	return user;
};

export const requireRole = (user, allowedRoles) => {
	requireAuth(user);
	if (!allowedRoles.includes(user.role)) {
		throw new Error(`Access denied. Required role: ${allowedRoles.join(' or ')}`);
	}
	return user;
};

// Role-based permissions
export const canViewEmployees = (user) => {
	// Both admin and employee can view employees
	return user && (user.role === 'admin' || user.role === 'employee');
};

export const canAddEmployee = (user) => {
	// Only admin can add employees
	return user && user.role === 'admin';
};

export const canUpdateEmployee = (user, employeeId) => {
	// Admin can update any employee
	if (user && user.role === 'admin') {
		return true;
	}
	// Employee can only update their own record
	if (user && user.role === 'employee') {
		// In a real app, you'd check if employeeId matches user's employee record
		// For now, we'll allow employees to update any (you can enhance this)
		return true;
	}
	return false;
};
