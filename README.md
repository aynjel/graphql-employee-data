# GraphQL Employee Data API

A comprehensive GraphQL API for managing employee data with authentication, authorization, pagination,
sorting, and performance optimizations.

## Features

- ✅ **GraphQL API** with Apollo Server
- ✅ **Data Model**: Employee with ID, name, age, class, subjects, and attendance
- ✅ **Queries**: List employees (with filters), get single employee, paginated list
- ✅ **Mutations**: Add and update employees
- ✅ **Pagination & Sorting**: Full support for pagination and sorting
- ✅ **Authentication**: JWT-based authentication
- ✅ **Role-Based Authorization**: Admin and Employee roles with different permissions
- ✅ **Performance Optimizations**: DataLoader for batching and caching

## Installation

```bash
npm install
```

## Building the Project

Since this project uses TypeScript, you need to build it before running:

```bash
npm run build
```

## Running the Server

```bash
# Production mode (requires build first)
npm start

# Development mode (with hot reload using nodemon)
npm run dev

# Alternative: Development mode using tsx directly
npm run dev:tsx
```

The server will start on `http://localhost:4000`

## Authentication

### Default Users

- **Admin**:

  - Username: `admin`
  - Password: `admin123`
  - Can: View all data, add employees, update employees

- **Employee**:
  - Username: `employee`
  - Password: `emp123`
  - Can: View all data only (cannot add or update)

### Getting a Token

```graphql
query {
	login(username: "admin", password: "admin123") {
		token
		user {
			id
			username
			role
		}
	}
}
```

### Using the Token

Include the token in the `Authorization` header:

```
Authorization: Bearer <your-token-here>
```

## GraphQL Schema

### Queries

#### `listEmployees`

List all employees with optional filters and sorting.

**Parameters:**

- `name` (String): Filter by name (partial match)
- `age` (Int): Filter by exact age
- `class` (String): Filter by class
- `subject` (String): Filter by subject
- `sortBy` (String): Field to sort by (e.g., "name", "age")
- `sortOrder` (SortOrder): ASC or DESC

**Example:**

```graphql
query {
	listEmployees(name: "John", sortBy: "age", sortOrder: DESC) {
		id
		name
		age
		class
		subjects
	}
}
```

#### `getEmployee`

Get a single employee by ID.

**Parameters:**

- `id` (ID!): Employee ID

**Example:**

```graphql
query {
	getEmployee(id: "1") {
		id
		name
		age
		class
		subjects
		attendance {
			date
			status
		}
	}
}
```

#### `listEmployeesPaginated`

List employees with pagination support.

**Parameters:**

- `page` (Int): Page number (default: 1)
- `limit` (Int): Items per page (default: 10)
- `name`, `age`, `class`, `subject`: Same filters as `listEmployees`
- `sortBy`, `sortOrder`: Same sorting as `listEmployees`

**Example:**

```graphql
query {
	listEmployeesPaginated(page: 1, limit: 5, sortBy: "name") {
		data {
			id
			name
			age
		}
		pagination {
			page
			limit
			total
			totalPages
			hasNextPage
			hasPreviousPage
		}
	}
}
```

### Mutations

#### `addEmployee` (Admin only)

Add a new employee.

**Parameters:**

- `input` (EmployeeInput!): Employee data

**Example:**

```graphql
mutation {
	addEmployee(
		input: {
			name: "Alice Brown"
			age: 27
			class: "9th"
			subjects: ["Art", "Music"]
			attendance: [{ date: "2024-01-18", status: "present" }]
		}
	) {
		id
		name
		age
	}
}
```

#### `updateEmployee` (Admin only)

Update an existing employee.

**Parameters:**

- `id` (ID!): Employee ID
- `input` (EmployeeInput!): Updated employee data

**Example:**

```graphql
mutation {
	updateEmployee(
		id: "1"
		input: { name: "John Doe Updated", age: 26, class: "10th", subjects: ["Math", "Science"] }
	) {
		id
		name
		age
	}
}
```

## Authorization

### Role Permissions

**Admin:**

- ✅ View all employees (all queries)
- ✅ Add employees
- ✅ Update employees

**Employee:**

- ✅ View all employees (all queries)
- ❌ Add employees
- ❌ Update employees

## Performance Optimizations

1. **DataLoader**: Implements batching and caching to prevent N+1 query problems
2. **Efficient Filtering**: In-memory filtering with optimized algorithms
3. **Pagination**: Server-side pagination to limit data transfer
4. **Caching**: DataLoader provides automatic caching for repeated queries

## Project Structure

```
graphql-employee-data/
├── server.ts                 # Main server file (TypeScript)
├── tsconfig.json             # TypeScript configuration
├── schema/
│   ├── typeDefs.ts          # GraphQL schema definitions
│   └── resolvers.ts         # GraphQL resolvers
├── models/
│   ├── Employee.ts          # Employee model
│   └── User.ts              # User model
├── data/
│   └── store.ts             # In-memory data store
├── utils/
│   ├── auth.ts              # Authentication utilities
│   ├── authorization.ts     # Authorization utilities
│   ├── dataloaders.ts       # DataLoader instances
│   └── pagination.ts        # Pagination utilities
├── types/
│   ├── index.ts             # Type definitions
│   └── graphql.ts           # GraphQL-specific types
└── examples/
    └── queries.graphql      # Example queries
```

## Environment Variables

- `JWT_SECRET`: Secret key for JWT tokens (default: 'your-secret-key-change-in-production')

Set in production:

```bash
export JWT_SECRET=your-production-secret-key
```

## Example Usage

1. **Start the server**: `npm start`
2. **Open GraphQL Playground**: Navigate to `http://localhost:4000`
3. **Login** to get a token
4. **Set Authorization header** in the playground (bottom left)
5. **Run queries and mutations** as needed

See `examples/queries.graphql` for more examples.
