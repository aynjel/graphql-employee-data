# Testing Guide

## Quick Start

1. **Start the server:**

   ```bash
   npm run dev
   ```

2. **In another terminal, run the test script:**
   ```bash
   node test-api.js
   ```

## Manual Testing

### Step 1: Login and Get Token

```bash
curl -X POST http://localhost:3000/api/graphql \
  -H "Content-Type: application/json" \
  -d '{
    "query": "mutation { login(username: \"admin\", password: \"admin123\") { token user { username role } } }"
  }'
```

**Save the token from the response!**

### Step 2: Test Queries (Replace YOUR_TOKEN)

**Get all employees:**

```bash
curl -X POST http://localhost:3000/api/graphql \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "query": "{ employees { id name age class subjects } }"
  }'
```

**Get single employee:**

```bash
curl -X POST http://localhost:3000/api/graphql \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "query": "{ employee(id: \"1\") { id name age class subjects attendance { date status } } }"
  }'
```

**Get employees with pagination:**

```bash
curl -X POST http://localhost:3000/api/graphql \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "query": "{ employeesPaginated(page: 1, limit: 2) { totalCount edges { node { id name } } pageInfo { currentPage totalPages hasNextPage } } }"
  }'
```

**Get employees with filters and sorting:**

```bash
curl -X POST http://localhost:3000/api/graphql \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "query": "{ employees(filters: { minAge: 20, maxAge: 30 }, sortBy: name, sortOrder: ASC) { id name age class } }"
  }'
```

### Step 3: Test Mutations (Admin Token Required)

**Add employee:**

```bash
curl -X POST http://localhost:3000/api/graphql \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "query": "mutation { addEmployee(input: { name: \"New Employee\" age: 25 class: \"10th\" subjects: [\"Math\", \"Science\"] }) { id name age } }"
  }'
```

**Update employee:**

```bash
curl -X POST http://localhost:3000/api/graphql \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "query": "mutation { updateEmployee(id: \"1\", input: { name: \"Updated Name\" age: 26 class: \"11th\" }) { id name age class } }"
  }'
```

## Using GraphQL Playground

1. Install a GraphQL client like [Altair](https://altairgraphql.dev/) or use
   [GraphQL Playground](https://github.com/graphql/graphql-playground)

2. Set endpoint to: `http://localhost:3000/api/graphql`

3. For authenticated queries, add header:

   ```
   Authorization: Bearer YOUR_TOKEN
   ```

4. Copy queries from `examples/queries.md`

## Using Postman

1. Create a new POST request
2. URL: `http://localhost:3000/api/graphql`
3. Headers:
   - `Content-Type: application/json`
   - `Authorization: Bearer YOUR_TOKEN` (for authenticated requests)
4. Body (raw JSON):
   ```json
   {
   	"query": "{ employees { id name age } }"
   }
   ```

## Testing Authorization

### Test Admin Access

1. Login as admin: `username: "admin", password: "admin123"`
2. Try adding an employee - should succeed
3. Try updating any employee - should succeed

### Test Employee Access

1. Login as employee: `username: "employee", password: "emp123"`
2. Try viewing employees - should succeed
3. Try adding an employee - should fail with "Access denied"
4. Try updating an employee - should succeed (employees can update)

### Test Unauthenticated Access

1. Try querying employees without a token - should fail with "Authentication required"

## Troubleshooting

**Server won't start:**

- Make sure port 3000 is not in use
- Check Node.js version: `node --version` (should be 18+)
- Install dependencies: `npm install`

**Authentication errors:**

- Make sure you're including the `Authorization: Bearer TOKEN` header
- Token might be expired (tokens last 24 hours)
- Login again to get a new token

**CORS errors:**

- The server already handles CORS, but if you see errors, make sure you're using the correct endpoint

**GraphQL errors:**

- Check the error message in the response
- Make sure your query syntax is correct
- Verify you have the right permissions for the operation
