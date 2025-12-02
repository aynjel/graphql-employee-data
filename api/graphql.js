import { makeExecutableSchema } from '@graphql-tools/schema';
import { graphql } from 'graphql';
import { employeeLoader } from '../data/dataLoader.js';
import { employeeStore, userStore } from '../data/store.js';
import { generateToken } from '../utils/auth.js';
import {
	authenticate,
	canUpdateEmployee,
	canViewEmployees,
	requireAuth,
	requireRole,
} from '../utils/authorization.js';
import { applyPagination, applySorting } from '../utils/pagination.js';

const typeDefs = `
	type Query {
		# List all employees with optional filters
		employees(
			filters: EmployeeFilters
			sortBy: EmployeeSortField
			sortOrder: SortOrder
		): [Employee!]!
		
		# Get a single employee by ID
		employee(id: ID!): Employee
		
		# List employees with pagination
		employeesPaginated(
			filters: EmployeeFilters
			sortBy: EmployeeSortField
			sortOrder: SortOrder
			page: Int
			limit: Int
		): EmployeeConnection!
		
		# Get current authenticated user
		me: User
	}

	type Mutation {
		# Authentication mutation
		login(username: String!, password: String!): AuthPayload!
		
		# Add a new employee (admin only)
		addEmployee(input: EmployeeInput!): Employee!
		
		# Update an existing employee (admin can update any, employee can update own)
		updateEmployee(id: ID!, input: EmployeeInput!): Employee!
	}

	type Employee {
		id: ID!
		name: String!
		age: Int!
		class: String!
		subjects: [String!]!
		attendance: [Attendance!]!
	}

	type Attendance {
		date: String!
		status: String!
	}

	input EmployeeInput {
		name: String!
		age: Int!
		class: String!
		subjects: [String!]
		attendance: [AttendanceInput!]
	}

	input AttendanceInput {
		date: String!
		status: String!
	}

	input EmployeeFilters {
		name: String
		age: Int
		minAge: Int
		maxAge: Int
		class: String
		subject: String
	}

	enum EmployeeSortField {
		id
		name
		age
		class
	}

	enum SortOrder {
		ASC
		DESC
	}

	type EmployeeConnection {
		edges: [EmployeeEdge!]!
		pageInfo: PageInfo!
		totalCount: Int!
	}

	type EmployeeEdge {
		node: Employee!
		cursor: String!
	}

	type PageInfo {
		currentPage: Int!
		perPage: Int!
		totalItems: Int!
		totalPages: Int!
		hasNextPage: Boolean!
		hasPreviousPage: Boolean!
	}

	type User {
		id: ID!
		username: String!
		role: String!
	}

	type AuthPayload {
		token: String!
		user: User!
	}
`;

const resolvers = {
	Query: {
		employees: async (parent, args, context) => {
			// Authorization: Both admin and employee can view
			requireAuth(context.user);
			canViewEmployees(context.user);

			let employees = employeeStore.getAll(args.filters || {});

			// Apply sorting
			if (args.sortBy) {
				employees = applySorting(employees, args.sortBy, args.sortOrder || 'ASC');
			}

			return employees;
		},

		employee: async (parent, args, context) => {
			// Authorization: Both admin and employee can view
			requireAuth(context.user);
			canViewEmployees(context.user);

			// Use DataLoader for performance optimization (batching and caching)
			return employeeLoader.load(args.id);
		},

		employeesPaginated: async (parent, args, context) => {
			// Authorization: Both admin and employee can view
			requireAuth(context.user);
			canViewEmployees(context.user);

			let employees = employeeStore.getAll(args.filters || {});

			// Apply sorting
			if (args.sortBy) {
				employees = applySorting(employees, args.sortBy, args.sortOrder || 'ASC');
			}

			// Apply pagination
			const { items, pageInfo } = applyPagination(employees, args.page || 1, args.limit || 10);

			// Format as connection type
			const edges = items.map((employee, index) => ({
				node: employee,
				cursor: Buffer.from(`employee:${employee.id}:${index}`).toString('base64'),
			}));

			return {
				edges,
				pageInfo,
				totalCount: pageInfo.totalItems,
			};
		},

		me: async (parent, args, context) => {
			return context.user || null;
		},
	},

	Mutation: {
		login: async (parent, args) => {
			const user = userStore.findByUsername(args.username);
			if (!user) {
				throw new Error('Invalid credentials');
			}

			const isValid = userStore.verifyPassword(user, args.password);
			if (!isValid) {
				throw new Error('Invalid credentials');
			}

			const token = generateToken(user);
			return {
				token,
				user: user.toJSON(),
			};
		},

		addEmployee: async (parent, args, context) => {
			// Authorization: Only admin can add
			requireRole(context.user, ['admin']);

			const newEmployee = employeeStore.add(args.input);
			// Clear DataLoader cache when data changes
			employeeLoader.clearAll();
			return newEmployee;
		},

		updateEmployee: async (parent, args, context) => {
			// Authorization: Admin can update any, employee can update own
			requireAuth(context.user);
			if (!canUpdateEmployee(context.user, args.id)) {
				throw new Error('Access denied. You do not have permission to update this employee.');
			}

			const updated = employeeStore.update(args.id, args.input);
			if (!updated) {
				throw new Error(`Employee with id ${args.id} not found`);
			}
			// Clear DataLoader cache when data changes
			employeeLoader.clearAll();
			return updated;
		},
	},
};

const schema = makeExecutableSchema({
	typeDefs,
	resolvers,
});

export default async (req, res) => {
	const { method, body, query: queryParams } = req;

	// Set CORS headers for Vercel
	res.setHeader('Access-Control-Allow-Origin', '*');
	res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
	res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

	// Handle preflight requests
	if (method === 'OPTIONS') {
		res.status(200).end();
		return;
	}

	if (method !== 'POST' && method !== 'GET') {
		res.status(405).json({ error: 'Method not allowed' });
		return;
	}

	// Extract GraphQL query, variables, and operationName
	let query, variables, operationName;

	if (method === 'GET') {
		query = queryParams.query;
		variables = queryParams.variables ? JSON.parse(queryParams.variables) : undefined;
		operationName = queryParams.operationName;
	} else {
		// POST request
		query = body.query;
		variables = body.variables;
		operationName = body.operationName;
	}

	if (!query) {
		res.status(400).json({ error: 'GraphQL query is required' });
		return;
	}

	try {
		// Authenticate user and add to context
		const user = await authenticate(req);

		// Create context with authenticated user
		const context = {
			user,
			req,
			res,
		};

		const result = await graphql({
			schema,
			source: query,
			variableValues: variables,
			operationName: operationName,
			contextValue: context,
		});

		// Handle GraphQL errors
		if (result.errors) {
			res.status(200).json(result); // GraphQL returns 200 even with errors
		} else {
			res.status(200).json(result);
		}
	} catch (error) {
		res.status(500).json({ error: error.message });
	}
};
