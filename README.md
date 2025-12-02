# GraphQL Employee Data API

A GraphQL API for managing employee data with authentication, authorization, pagination, and sorting.

## Features

- ✅ **Data Model**: Employee data with ID, name, age, class, subjects, and attendance
- ✅ **GraphQL Schema**: Queries (list, single, paginated) and Mutations (add, update)
- ✅ **Pagination & Sorting**: Full pagination support with sorting capabilities
- ✅ **Authentication & Authorization**: JWT-based auth with role-based access control (admin, employee)
- ✅ **Performance Optimization**: DataLoader for batching and caching

## Requirements

- Node.js 18+ (for fetch API support in test script)
- npm or yarn

## Quick Start

### Install Dependencies

```bash
npm install
```

### Run Locally

#### Option 1: Simple Node.js Server (Recommended for quick testing)

```bash
npm run dev
```

The server will start at `http://localhost:3000/api/graphql`

#### Option 2: Vercel CLI (Recommended for production-like testing)

First, install Vercel CLI globally (if not already installed):

```bash
npm install -g vercel
```

Then run:

```bash
npm run vercel
```

This will start a local Vercel development server that closely mimics the production environment.

### Test the API

#### Using the Test Script

```bash
node test-api.js
```

This will run a series of automated tests to verify all endpoints work correctly.

#### Using cURL

1. **Login to get a token:**

```bash
curl -X POST http://localhost:3000/api/graphql \
  -H "Content-Type: application/json" \
  -d '{
    "query": "mutation { login(username: \"admin\", password: \"admin123\") { token user { username role } } }"
  }'
```

2. **Get all employees (replace YOUR_TOKEN with the token from step 1):**

```bash
curl -X POST http://localhost:3000/api/graphql \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "query": "{ employees { id name age class } }"
  }'
```

#### Using GraphQL Playground or Postman

1. Start the server: `npm run dev`
2. Open your GraphQL client
3. Set the endpoint to: `http://localhost:3000/api/graphql`
4. For authenticated queries, add header: `Authorization: Bearer YOUR_TOKEN`

## Default Users

- **Admin**:

  - Username: `admin`
  - Password: `admin123`
  - Can: View all employees, add employees, update any employee

- **Employee**:
  - Username: `employee`
  - Password: `emp123`
  - Can: View all employees, update employees

## API Examples

See `examples/queries.md` for detailed GraphQL query examples.

### Quick Examples

**Login:**

```graphql
mutation {
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

**Get Employees with Filters:**

```graphql
query {
	employees(filters: { minAge: 20, maxAge: 30 }, sortBy: name, sortOrder: ASC) {
		id
		name
		age
		class
	}
}
```

**Get Employees with Pagination:**

```graphql
query {
	employeesPaginated(page: 1, limit: 10) {
		totalCount
		edges {
			node {
				id
				name
				age
			}
		}
		pageInfo {
			currentPage
			totalPages
			hasNextPage
		}
	}
}
```

**Add Employee (Admin only):**

```graphql
mutation {
	addEmployee(input: { name: "New Employee", age: 25, class: "10th", subjects: ["Math", "Science"] }) {
		id
		name
	}
}
```

## Deployment

### Deploy to Vercel

1. Install Vercel CLI: `npm install -g vercel`
2. Run: `vercel`
3. Follow the prompts

Or connect your GitHub repository to Vercel for automatic deployments.

## Environment Variables

For production, set:

- `JWT_SECRET`: Secret key for JWT tokens (defaults to a development key if not set)

## Project Structure

```
├── api/
│   └── graphql.js          # Main GraphQL handler
├── data/
│   ├── store.js            # Data store and CRUD operations
│   └── dataLoader.js       # DataLoader for performance
├── models/
│   ├── Employee.js         # Employee model
│   └── User.js             # User model
├── utils/
│   ├── auth.js             # JWT authentication
│   ├── authorization.js    # Role-based access control
│   └── pagination.js       # Pagination and sorting utilities
├── examples/
│   └── queries.md          # Example queries
├── server.js               # Local development server
├── test-api.js             # Automated test script
└── package.json
```

## License

MIT
