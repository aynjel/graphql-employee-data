# GraphQL API Examples

## Authentication

### Login (Get Token)

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

## Queries

### Get All Employees (with filters and sorting)

```graphql
query {
	employees(filters: { name: "John", minAge: 20, maxAge: 30 }, sortBy: name, sortOrder: ASC) {
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

### Get Single Employee

```graphql
query {
	employee(id: "1") {
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

### Get Employees with Pagination

```graphql
query {
	employeesPaginated(filters: { class: "10th" }, sortBy: age, sortOrder: DESC, page: 1, limit: 10) {
		totalCount
		edges {
			node {
				id
				name
				age
				class
			}
			cursor
		}
		pageInfo {
			currentPage
			perPage
			totalPages
			hasNextPage
			hasPreviousPage
		}
	}
}
```

## Mutations

### Add Employee (Admin only)

```graphql
mutation {
	addEmployee(
		input: {
			name: "Alice Brown"
			age: 27
			class: "9th"
			subjects: ["Art", "Music"]
			attendance: [{ date: "2024-01-20", status: "present" }]
		}
	) {
		id
		name
		age
		class
	}
}
```

### Update Employee

```graphql
mutation {
	updateEmployee(
		id: "1"
		input: {
			name: "John Doe Updated"
			age: 26
			class: "11th"
			subjects: ["Math", "Science", "English", "History"]
		}
	) {
		id
		name
		age
		class
		subjects
	}
}
```

## Using with HTTP

### POST Request (with authentication)

```bash
curl -X POST https://your-project.vercel.app/api/graphql \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{
    "query": "{ employees { id name age } }"
  }'
```

### GET Request

```bash
curl "https://your-project.vercel.app/api/graphql?query={employees{id name age}}&variables={}" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```
