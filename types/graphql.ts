import type {
	AuthResponse,
	EmployeeData,
	EmployeeInput,
	EmployeePaginatedResponse,
	GraphQLContext,
} from './index.js';

export interface GraphQLResolvers<TContext = GraphQLContext> {
	Query: {
		listEmployees: (
			parent: unknown,
			args: {
				name?: string | null;
				age?: number | null;
				class?: string | null;
				subject?: string | null;
				sortBy?: string | null;
				sortOrder?: 'ASC' | 'DESC' | null;
			},
			context: TContext
		) => EmployeeData[];
		getEmployee: (parent: unknown, args: { id: string }, context: TContext) => Promise<EmployeeData | null>;
		listEmployeesPaginated: (
			parent: unknown,
			args: {
				page?: number | null;
				limit?: number | null;
				name?: string | null;
				age?: number | null;
				class?: string | null;
				subject?: string | null;
				sortBy?: string | null;
				sortOrder?: 'ASC' | 'DESC' | null;
			},
			context: TContext
		) => EmployeePaginatedResponse;
		login: (parent: unknown, args: { username: string; password: string }, context: TContext) => AuthResponse;
	};
	Mutation: {
		addEmployee: (parent: unknown, args: { input: EmployeeInput }, context: TContext) => EmployeeData;
		updateEmployee: (
			parent: unknown,
			args: { id: string; input: EmployeeInput },
			context: TContext
		) => EmployeeData;
	};
}
