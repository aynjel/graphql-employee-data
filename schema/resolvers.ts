import { employeeStore, userStore } from '../data/store.js';
import type { GraphQLResolvers } from '../types/graphql.js';
import type { GraphQLContext } from '../types/index.js';
import { authUtils } from '../utils/auth.js';
import { authorization } from '../utils/authorization.js';
import { clearEmployeeCache, employeeLoader } from '../utils/dataloaders.js';
import { paginationUtils } from '../utils/pagination.js';

export const resolvers: GraphQLResolvers<GraphQLContext> = {
	Query: {
		listEmployees: (_parent, args, context) => {
			if (!context.user) {
				throw new Error('Authentication required');
			}

			if (!authorization.hasPermission(context.user.role, 'listEmployees', 'queries')) {
				throw new Error('Access denied. Insufficient permissions.');
			}

			const filters = {
				name: args.name || undefined,
				age: args.age || undefined,
				class: args.class || undefined,
				subject: args.subject || undefined,
			};

			let employees = employeeStore.getAll(filters);

			if (args.sortBy) {
				employees = paginationUtils.sort(employees, args.sortBy, args.sortOrder || 'ASC');
			}

			return employees.map((emp) => emp.toJSON());
		},

		getEmployee: async (_parent, args, context) => {
			if (!context.user) {
				throw new Error('Authentication required');
			}

			if (!authorization.hasPermission(context.user.role, 'getEmployee', 'queries')) {
				throw new Error('Access denied. Insufficient permissions.');
			}

			const employee = await employeeLoader.load(args.id);
			return employee ? employee.toJSON() : null;
		},

		listEmployeesPaginated: (_parent, args, context) => {
			if (!context.user) {
				throw new Error('Authentication required');
			}

			if (!authorization.hasPermission(context.user.role, 'listEmployeesPaginated', 'queries')) {
				throw new Error('Access denied. Insufficient permissions.');
			}

			const page = args.page || 1;
			const limit = args.limit || 10;

			const filters = {
				name: args.name || undefined,
				age: args.age || undefined,
				class: args.class || undefined,
				subject: args.subject || undefined,
			};

			let employees = employeeStore.getAll(filters);

			if (args.sortBy) {
				employees = paginationUtils.sort(employees, args.sortBy, args.sortOrder || 'ASC');
			}

			const result = paginationUtils.paginate(employees, page, limit);

			return {
				data: result.data.map((emp) => emp.toJSON()),
				pagination: result.pagination,
			};
		},

		login: (_parent, args) => {
			const user = userStore.findByUsername(args.username);
			if (!user) {
				throw new Error('Invalid username or password');
			}

			if (!userStore.verifyPassword(user, args.password)) {
				throw new Error('Invalid username or password');
			}

			const token = authUtils.generateToken(user.toJSON());
			return {
				token,
				user: user.toJSON(),
			};
		},
	},

	Mutation: {
		addEmployee: (_parent, args, context) => {
			if (!context.user) {
				throw new Error('Authentication required');
			}

			if (!authorization.hasPermission(context.user.role, 'addEmployee', 'mutations')) {
				throw new Error('Access denied. Only administrators can add employees.');
			}

			const newEmployee = employeeStore.add(args.input);
			clearEmployeeCache();
			return newEmployee.toJSON();
		},

		updateEmployee: (_parent, args, context) => {
			if (!context.user) {
				throw new Error('Authentication required');
			}

			if (!authorization.hasPermission(context.user.role, 'updateEmployee', 'mutations')) {
				throw new Error('Access denied. Only administrators can update employees.');
			}

			const updated = employeeStore.update(args.id, args.input);
			if (!updated) {
				throw new Error(`Employee with ID ${args.id} not found`);
			}
			clearEmployeeCache();
			return updated.toJSON();
		},
	},
};
