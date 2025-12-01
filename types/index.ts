export interface Attendance {
	date: string;
	status: string;
}

export interface EmployeeData {
	id: string;
	name: string;
	age: number;
	class: string;
	subjects: string[];
	attendance: Attendance[];
}

export interface EmployeeInput {
	name: string;
	age: number;
	class: string;
	subjects: string[];
	attendance?: Attendance[];
}

export interface AttendanceInput {
	date: string;
	status: string;
}

export interface User {
	id: string;
	username: string;
	password: string;
	role: 'admin' | 'employee';
}

export interface UserPayload {
	id: string;
	username: string;
	role: 'admin' | 'employee';
}

export interface JwtPayload {
	id: string;
	username: string;
	role: 'admin' | 'employee';
	iat?: number;
	exp?: number;
}

export interface EmployeeFilters {
	name?: string;
	age?: number;
	class?: string;
	subject?: string;
}

export interface PaginationResult<T> {
	data: T[];
	pagination: {
		page: number;
		limit: number;
		total: number;
		totalPages: number;
		hasNextPage: boolean;
		hasPreviousPage: boolean;
	};
}

export interface PaginationInfo {
	page: number;
	limit: number;
	total: number;
	totalPages: number;
	hasNextPage: boolean;
	hasPreviousPage: boolean;
}

export interface EmployeePaginatedResponse {
	data: EmployeeData[];
	pagination: PaginationInfo;
}

export interface AuthResponse {
	token: string;
	user: UserPayload;
}

export type SortOrder = 'ASC' | 'DESC';

export interface GraphQLContext {
	user: UserPayload | null;
}

export interface GraphQLRequest {
	headers: {
		authorization?: string;
		[key: string]: string | undefined;
	};
}
