# Testing GraphQL API on Vercel

## Important Notes

1. **Replace `your-project.vercel.app`** with your actual Vercel deployment URL
2. **URL encoding**: GraphQL queries in URLs need to be URL-encoded
3. **Authentication**: JWT tokens go in the `Authorization` header, not the query string

## Method 1: GET Request (Simple Queries - No Auth Required)

### Login Query (No token needed)

```
https://your-project.vercel.app/api/graphql?query={login(username:"admin",password:"admin123"){token user{id username role}}}
```

**URL Encoded Version:**

```
https://your-project.vercel.app/api/graphql?query=%7Blogin(username%3A%22admin%22%2Cpassword%3A%22admin123%22)%7Btoken%20user%7Bid%20username%20role%7D%7D%7D
```

### List Employees (Requires Auth - Use POST instead)

For queries that require authentication, use POST with Authorization header.

## Method 2: GET Request with Authorization Header

### Using curl:

```bash
curl -X GET "https://your-project.vercel.app/api/graphql?query=%7BlistEmployees%7Bid%20name%20age%7D%7D" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Using Browser (Limited)

Browsers can't set custom headers in direct URL navigation. Use:

- **Postman** or **Insomnia** for testing
- **GraphQL Playground** at `https://your-project.vercel.app/api/graphql`
- **curl** or **fetch** in JavaScript

## Method 3: POST Request (Recommended for Authenticated Queries)

### Using curl:

```bash
# First, get a token
curl -X POST https://your-project.vercel.app/api/graphql \
  -H "Content-Type: application/json" \
  -d '{"query":"{ login(username: \"admin\", password: \"admin123\") { token user { id username role } } }"}'

# Then use the token for authenticated queries
curl -X POST https://your-project.vercel.app/api/graphql \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{"query":"{ listEmployees { id name age class } }"}'
```

## Method 4: Using JavaScript/Fetch

```javascript
// Get token
const loginResponse = await fetch('https://your-project.vercel.app/api/graphql', {
	method: 'POST',
	headers: { 'Content-Type': 'application/json' },
	body: JSON.stringify({
		query: `{
      login(username: "admin", password: "admin123") {
        token
        user { id username role }
      }
    }`,
	}),
});

const { data } = await loginResponse.json();
const token = data.login.token;

// Use token for authenticated query
const employeesResponse = await fetch('https://your-project.vercel.app/api/graphql', {
	method: 'POST',
	headers: {
		'Content-Type': 'application/json',
		Authorization: `Bearer ${token}`,
	},
	body: JSON.stringify({
		query: `{
      listEmployees {
        id
        name
        age
        class
        subjects
      }
    }`,
	}),
});

const employees = await employeesResponse.json();
console.log(employees);
```

## Method 5: Using GraphQL Playground

1. Visit: `https://your-project.vercel.app/api/graphql`
2. In the bottom left, add HTTP Headers:
   ```json
   {
   	"Authorization": "Bearer YOUR_JWT_TOKEN"
   }
   ```
3. Write your query in the left panel
4. Click the play button

## Common Mistakes to Avoid

❌ **Wrong**: Including JWT token in query string

```
?query={listEmployees{name}}&token=YOUR_TOKEN
```

✅ **Correct**: Use Authorization header

```
-H "Authorization: Bearer YOUR_TOKEN"
```
