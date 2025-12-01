import type { UserPayload } from '../types/index.js';

type OperationType = 'queries' | 'mutations';
type Role = 'admin' | 'employee';

interface Permissions {
	queries: string[];
	mutations: string[];
}

const PERMISSIONS: Record<Role, Permissions> = {
	admin: {
		queries: ['listEmployees', 'getEmployee', 'listEmployeesPaginated'],
		mutations: ['addEmployee', 'updateEmployee'],
	},
	employee: {
		queries: ['listEmployees', 'getEmployee', 'listEmployeesPaginated'],
		mutations: [],
	},
};

export const authorization = {
	hasPermission(
		userRole: Role | undefined,
		operation: string,
		operationType: OperationType = 'queries'
	): boolean {
		if (!userRole || !PERMISSIONS[userRole]) {
			return false;
		}
		return PERMISSIONS[userRole][operationType]?.includes(operation) || false;
	},

	requireRole(allowedRoles: Role[]) {
		return (user: UserPayload | null): boolean => {
			if (!user) {
				throw new Error('Authentication required');
			}
			if (!allowedRoles.includes(user.role)) {
				throw new Error(`Access denied. Required role: ${allowedRoles.join(' or ')}`);
			}
			return true;
		};
	},

	isAdmin(user: UserPayload | null): boolean {
		return user !== null && user.role === 'admin';
	},

	isEmployee(user: UserPayload | null): boolean {
		return user !== null && user.role === 'employee';
	},
};
