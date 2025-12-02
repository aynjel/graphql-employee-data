# Troubleshooting Vercel Deployment

## Common Issues and Solutions

### Issue: "This Serverless Function has crashed" (500 Error)

This usually means there's a runtime error. Here's how to debug:

#### 1. Check Vercel Function Logs

1. Go to your Vercel Dashboard
2. Click on your project
3. Go to "Deployments"
4. Click on the failed deployment
5. Click "Functions" tab
6. Click on `api/graphql`
7. View the logs to see the actual error

#### 2. Common Causes and Fixes

**A. Apollo Server Not Started**

- **Symptom:** Error about server not being started
- **Fix:** Make sure `server.start()` is called (already fixed in latest code)

**B. Import Path Issues**

- **Symptom:** "Cannot find module" errors
- **Fix:** Ensure all imports use `.js` extension (required for ES modules)
- **Check:** All imports in `api/graphql.ts` should end with `.js`

**C. Missing Dependencies**

- **Symptom:** "Module not found" errors
- **Fix:** Make sure all runtime dependencies are in `dependencies` (not `devDependencies`)
- **Check:** `@apollo/server`, `graphql`, `jsonwebtoken`, `bcryptjs`, `dataloader` should all be in
  `dependencies`

**D. TypeScript Compilation Issues**

- **Symptom:** Build succeeds but function crashes
- **Fix:** Vercel auto-compiles TypeScript, but check that:
  - All TypeScript files compile without errors
  - `tsconfig.json` is configured correctly
  - No syntax errors in the code

**E. Environment Variables Missing**

- **Symptom:** JWT errors or undefined variables
- **Fix:** Set `JWT_SECRET` in Vercel dashboard:
  1. Go to Project Settings → Environment Variables
  2. Add `JWT_SECRET` with a strong random value
  3. Redeploy

#### 3. Test Locally First

Before deploying, test the function locally:

```bash
# Build the project
npm run build

# Check if compiled files are correct
ls -la public/api/graphql.js
```

#### 4. Enable Debug Logging

Add console.log statements to debug:

```typescript
export default async function handler(req: Request): Promise<Response> {
	console.log('Handler called:', req.method, req.url);
	try {
		// ... your code
	} catch (error) {
		console.error('Error details:', error);
		throw error;
	}
}
```

Check logs in Vercel dashboard to see what's happening.

---

## How to View Detailed Error Logs

1. **Via Vercel Dashboard:**

   - Project → Deployments → [Latest Deployment] → Functions → `api/graphql` → Logs

2. **Via Vercel CLI:**

   ```bash
   vercel logs [deployment-url]
   ```

3. **Real-time logs:**
   ```bash
   vercel logs --follow
   ```

---

## Quick Debugging Steps

1. ✅ Check Vercel function logs (most important!)
2. ✅ Verify all dependencies are installed
3. ✅ Ensure environment variables are set
4. ✅ Test the build locally: `npm run build`
5. ✅ Check that imports use `.js` extensions
6. ✅ Verify Apollo Server is started correctly
7. ✅ Check TypeScript compilation errors

---

## Still Having Issues?

If you're still seeing errors:

1. **Copy the exact error message** from Vercel logs
2. **Check the function logs** in Vercel dashboard
3. **Verify the build succeeded** (check build logs)
4. **Test locally** to reproduce the issue

Common error patterns:

- `Cannot find module` → Import path issue
- `Server is not started` → Apollo Server initialization issue
- `undefined is not a function` → Missing dependency or wrong import
- `JWT_SECRET is not defined` → Environment variable missing
