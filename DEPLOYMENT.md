# Step-by-Step Guide: Deploying GraphQL API to Vercel

Yes, your GraphQL API is **fully compatible** with Vercel! This guide will walk you through the deployment
process.

## Prerequisites

- ✅ A GitHub, GitLab, or Bitbucket account (for automatic deployments)
- ✅ Node.js installed locally (for testing)
- ✅ Your project is ready (all code is complete)

## Method 1: Deploy via Vercel Dashboard (Recommended for First Time)

### Step 1: Prepare Your Project

1. **Make sure your code is committed to Git:**

   ```bash
   git add .
   git commit -m "Ready for Vercel deployment"
   git push
   ```

2. **Verify your project structure:**
   - ✅ `api/graphql.ts` exists (this is your serverless function)
   - ✅ `package.json` has a `build` script
   - ✅ `vercel.json` exists (we'll create this)

### Step 2: Create Vercel Account & Project

1. **Go to [vercel.com](https://vercel.com)** and sign up/login
2. **Click "Add New Project"**
3. **Import your Git repository:**
   - Connect your GitHub/GitLab/Bitbucket account if not already connected
   - Select your `graphql-employee-data` repository
   - Click "Import"

### Step 3: Configure Project Settings

Vercel should auto-detect your settings, but verify:

1. **Framework Preset:** Leave as "Other" (or "No Framework")
2. **Root Directory:** Leave as `./` (root)
3. **Build Command:** `npm run build`
4. **Output Directory:** `public` (or leave empty if using TypeScript directly)
5. **Install Command:** `npm install`

### Step 4: Set Environment Variables

1. **In the Vercel project settings, go to "Environment Variables"**
2. **Add the following variable:**
   - **Name:** `JWT_SECRET`
   - **Value:** `your-super-secret-jwt-key-change-this-in-production`
   - **Environment:** Production, Preview, Development (select all)
3. **Click "Save"**

### Step 5: Deploy

1. **Click "Deploy"**
2. **Wait for the build to complete** (usually 1-2 minutes)
3. **Once deployed, you'll get a URL like:** `https://your-project.vercel.app`

### Step 6: Test Your Deployment

Your GraphQL endpoint will be available at:

```
https://your-project.vercel.app/api/graphql
```

**Test with a simple query:**

```bash
curl https://your-project.vercel.app/api/graphql?query="{__typename}"
```

Or visit in browser to see the GraphQL Playground:

```
https://your-project.vercel.app/api/graphql
```

---

## Method 2: Deploy via Vercel CLI (For Advanced Users)

### Step 1: Install Vercel CLI

```bash
npm install -g vercel
```

### Step 2: Login to Vercel

```bash
vercel login
```

This will open your browser to authenticate.

### Step 3: Navigate to Your Project

```bash
cd /path/to/graphql-employee-data
```

### Step 4: Deploy

```bash
# First deployment (will ask questions)
vercel

# For production deployment
vercel --prod
```

**During first deployment, you'll be asked:**

- Set up and deploy? **Yes**
- Which scope? **Select your account**
- Link to existing project? **No** (for first time)
- Project name? **graphql-employee-data** (or your preferred name)
- Directory? **./** (current directory)
- Override settings? **No**

### Step 5: Set Environment Variables

```bash
vercel env add JWT_SECRET
```

Enter your secret key when prompted. Select all environments (Production, Preview, Development).

### Step 6: Redeploy with Environment Variables

```bash
vercel --prod
```

---

## Method 3: Automatic Deployments (Recommended for Ongoing Development)

Once you've set up your project via Method 1 or 2:

1. **Every push to your main/master branch** will automatically deploy to production
2. **Every pull request** will create a preview deployment
3. **No manual deployment needed!**

---

## Important Configuration Files

### `vercel.json` (Already Created)

This file tells Vercel how to build and deploy your project:

```json
{
	"buildCommand": "npm run build",
	"installCommand": "npm install"
}
```

**Note:** Vercel automatically detects and compiles TypeScript files in the `api/` directory, so we don't need
to specify the runtime manually.

### `package.json` Build Script

Make sure you have:

```json
{
	"scripts": {
		"build": "tsc"
	}
}
```

### TypeScript Configuration

Your `tsconfig.json` should compile to the `public` directory:

```json
{
	"compilerOptions": {
		"outDir": "./public"
	}
}
```

---

## Troubleshooting

### Issue: Build Fails

**Solution:**

1. Check build logs in Vercel dashboard
2. Make sure all dependencies are in `dependencies` (not `devDependencies`)
3. Verify TypeScript compiles locally: `npm run build`

### Issue: Function Not Found (404)

**Solution:**

1. Ensure `api/graphql.ts` exists in the root `api/` directory
2. Check that the file exports a default function
3. Verify the build output includes `public/api/graphql.js`

### Issue: Environment Variables Not Working

**Solution:**

1. Go to Vercel dashboard → Project Settings → Environment Variables
2. Make sure variables are set for the correct environment
3. Redeploy after adding/changing environment variables

### Issue: CORS Errors

**Solution:** Your code already handles CORS, but if you see issues:

- Check that the `Authorization` header is being sent correctly
- Verify the endpoint URL is correct

### Issue: TypeScript Errors

**Solution:**

1. Make sure `@types/node` is in `devDependencies`
2. Run `npm run build` locally to catch errors before deploying
3. Check that all imports use `.js` extensions (required for ES modules)

---

## Testing Your Deployed API

### 1. GraphQL Playground

Visit: `https://your-project.vercel.app/api/graphql`

You'll see an interactive GraphQL Playground where you can:

- Write queries
- Test mutations
- Set headers (like Authorization)

### 2. Login Mutation

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

### 3. Query with Authentication

After getting a token, add it to headers:

```
Authorization: Bearer YOUR_TOKEN_HERE
```

Then query:

```graphql
query {
	listEmployees {
		id
		name
		age
		class
	}
}
```

### 4. Using cURL

```bash
# Login
curl -X POST https://your-project.vercel.app/api/graphql \
  -H "Content-Type: application/json" \
  -d '{
    "query": "mutation { login(username: \"admin\", password: \"admin123\") { token } }"
  }'

# Use token in subsequent requests
curl -X POST https://your-project.vercel.app/api/graphql \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "query": "{ listEmployees { id name } }"
  }'
```

---

## Production Checklist

Before going live, make sure:

- [ ] `JWT_SECRET` is set to a strong, random value
- [ ] All sensitive data is in environment variables
- [ ] CORS is configured correctly (if needed for frontend)
- [ ] Error handling is in place
- [ ] You've tested all queries and mutations
- [ ] Authentication is working correctly
- [ ] Authorization (role-based access) is working

---

## Monitoring & Logs

- **View logs:** Vercel Dashboard → Your Project → Deployments → Click a deployment → Functions → View logs
- **Monitor performance:** Vercel Dashboard → Analytics
- **Check errors:** Vercel Dashboard → Your Project → Logs

---

## Updating Your Deployment

### Automatic (Recommended)

Just push to your main branch:

```bash
git add .
git commit -m "Update API"
git push
```

Vercel will automatically deploy!

### Manual

```bash
vercel --prod
```

---

## Need Help?

- **Vercel Docs:** https://vercel.com/docs
- **Vercel Support:** https://vercel.com/support
- **Check build logs** in the Vercel dashboard for specific errors

---

## Quick Reference

| Item                     | Value                                         |
| ------------------------ | --------------------------------------------- |
| **Endpoint**             | `https://your-project.vercel.app/api/graphql` |
| **Build Command**        | `npm run build`                               |
| **Node Version**         | 20.x                                          |
| **Runtime**              | Serverless Function                           |
| **Environment Variable** | `JWT_SECRET`                                  |

---

**You're all set! 🚀**

Your GraphQL API is now deployed and ready to use!
