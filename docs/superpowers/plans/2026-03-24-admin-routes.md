# Admin Routes Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add admin-authenticated API routes for managing users (list with pagination/search, update bio) behind a separate `ADMIN_API_KEY`.

**Architecture:** A new `ADMIN_API_KEY` env var is validated at startup alongside the existing `API_KEY`. A new `authenticateAdminKey` middleware guards `/api/admin/*` routes. Admin routes expose user listing (with name search + cursor-based pagination) and bio update — reusing the existing User model and repository layer.

**Tech Stack:** TypeScript, Express 5, Mongoose, Zod, envalid

---

## File Map

| Action | File | Responsibility |
|--------|------|----------------|
| Modify | `config/index.ts` | Add `ADMIN_API_KEY` env var |
| Modify | `.env.example` | Document the new var |
| Modify | `src/middlewares/auth.middleware.ts` | Add `authenticateAdminKey` function |
| Create | `src/validations/admin.validation.ts` | Zod schemas for admin query/body params |
| Modify | `src/repositories/user.repository.ts` | Add `searchUsers` (paginated, name-filtered) and `updateUserBio` |
| Create | `src/controller/admin.controller.ts` | Admin request handlers |
| Create | `src/routes/admin.route.ts` | Admin route definitions |
| Modify | `src/routes/index.route.ts` | Mount admin routes with admin auth middleware |

---

### Task 1: Add `ADMIN_API_KEY` to config

**Files:**
- Modify: `config/index.ts:8-18`
- Modify: `.env.example`

- [ ] **Step 1: Add ADMIN_API_KEY to envalid config**

In `config/index.ts`, add the new env var inside the `cleanEnv` call:

```typescript
export const config = cleanEnv(process.env, {
	MONGODB_URI: str(),
	STRAVA_CLUB_ID: num(),
	STRAVA_CLIENT_ID: num(),
	STRAVA_CLIENT_SECRET: str(),
	STRAVA_REFRESH_TOKEN: str(),
	SLACK_BOT_TOKEN: str(),
	SLACK_CHANNEL_NAME: str(),
	API_KEY: str(),
	ADMIN_API_KEY: str(),
	START_CRON_JOB: bool({ default: true }),
});
```

- [ ] **Step 2: Update .env.example**

Add after the `API_KEY` line:

```
ADMIN_API_KEY=any-admin-key-you-want
```

- [ ] **Step 3: Add ADMIN_API_KEY to your local .env**

Set a value for `ADMIN_API_KEY` in your `.env` file.

- [ ] **Step 4: Verify the app starts**

Run: `yarn dev`
Expected: App starts without envalid errors (assuming `.env` has the new var).

- [ ] **Step 5: Commit**

```bash
git add config/index.ts .env.example
git commit -m "feat: add ADMIN_API_KEY env var"
```

---

### Task 2: Add admin auth middleware

**Files:**
- Modify: `src/middlewares/auth.middleware.ts`

- [ ] **Step 1: Add authenticateAdminKey function**

Add below the existing `authenticateApiKey` function in `auth.middleware.ts`:

```typescript
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function authenticateAdminKey(req: any, res: any, next: any) {
	const tokenPrefix = "bearer ";
	const { authorization } = req.headers;

	if (!authorization || !authorization.toLowerCase().startsWith(tokenPrefix)) {
		return res.status(401).json({
			message: "Unauthorized: Missing or invalid authorization header",
		});
	}

	const token = authorization.slice(tokenPrefix.length).trim();

	if (token !== config.ADMIN_API_KEY) {
		return res.status(401).json({ message: "Unauthorized: Invalid admin API key" });
	}

	return next();
}
```

- [ ] **Step 2: Export the new function**

Update the default export:

```typescript
export default {
	authenticateApiKey,
	authenticateAdminKey,
};
```

- [ ] **Step 3: Commit**

```bash
git add src/middlewares/auth.middleware.ts
git commit -m "feat: add admin API key auth middleware"
```

---

### Task 3: Add admin validation schemas

**Files:**
- Create: `src/validations/admin.validation.ts`

- [ ] **Step 1: Create the validation file**

Create `src/validations/admin.validation.ts`:

```typescript
import { z } from "zod";

// Query params for GET /api/admin/users
export const adminUserListQuerySchema = z.object({
	search: z.string().trim().optional(),
	cursor: z
		.string()
		.regex(/^[0-9a-fA-F]{24}$/, "Invalid cursor format")
		.optional(),
	limit: z.coerce.number().int().min(1).max(100).default(20),
});

export type TAdminUserListQuery = z.infer<typeof adminUserListQuerySchema>;

// MongoDB ObjectId param
const mongoIdSchema = z
	.string()
	.trim()
	.regex(/^[0-9a-fA-F]{24}$/, "Invalid MongoDB ObjectId format");

// Body for PATCH /api/admin/users/:userId
export const updateUserBioSchema = z.object({
	bio: z.string().trim().max(500, "Bio must be 500 characters or less"),
});

export type TUpdateUserBio = z.infer<typeof updateUserBioSchema>;
```

- [ ] **Step 2: Commit**

```bash
git add src/validations/admin.validation.ts
git commit -m "feat: add Zod schemas for admin routes"
```

---

### Task 4: Add user repository methods

**Files:**
- Modify: `src/repositories/user.repository.ts`

- [ ] **Step 1: Add searchUsers and updateUserBio**

Add the following imports and functions below the existing code. Update the import line to include `Types` from mongoose, and update the default export to include the new functions.

Add the `Types` import at the top:

```typescript
import { Types } from "mongoose";
```

Add the following after the existing `listAllUsers` function:

```typescript
interface SearchUsersOptions {
	search?: string;
	cursor?: string;
	limit: number;
}

interface PaginatedUsers {
	users: IUser[];
	nextCursor: string | null;
}

async function searchUsers(options: SearchUsersOptions): Promise<PaginatedUsers> {
	const { search, cursor, limit } = options;

	const filter: Record<string, unknown> = {};

	if (search) {
		const escaped = search.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
		const regex = new RegExp(escaped, "i");
		filter.$or = [{ firstName: regex }, { lastName: regex }];
	}

	if (cursor) {
		filter._id = { $gt: new Types.ObjectId(cursor) };
	}

	const users = await User.find(filter)
		.sort({ _id: 1 })
		.limit(limit + 1)
		.lean();

	const hasMore = users.length > limit;
	const results = hasMore ? users.slice(0, limit) : users;
	const nextCursor = hasMore ? String(results[results.length - 1]._id) : null;

	return { users: results, nextCursor };
}

async function updateUserBio(userId: string, bio: string): Promise<IUser | null> {
	return User.findByIdAndUpdate(userId, { bio }, { new: true }).lean();
}

```

Update the default export to include the new functions:

```typescript
export default {
	listAllUsers,
	searchUsers,
	updateUserBio,
};
```

- [ ] **Step 2: Commit**

```bash
git add src/repositories/user.repository.ts
git commit -m "feat: add searchUsers and updateUserBio to user repository"
```

---

### Task 5: Add admin controller

**Files:**
- Create: `src/controller/admin.controller.ts`

- [ ] **Step 1: Create the admin controller**

Create `src/controller/admin.controller.ts`:

```typescript
import { Request, Response, NextFunction } from "express";
import { adminUserListQuerySchema, updateUserBioSchema } from "../validations/admin.validation";
import userRepository from "../repositories/user.repository";

async function listUsers(req: Request, res: Response, next: NextFunction) {
	try {
		const query = adminUserListQuerySchema.parse(req.query);
		const result = await userRepository.searchUsers({
			search: query.search,
			cursor: query.cursor,
			limit: query.limit,
		});

		res.json({
			status: "OK",
			message: "Users fetched successfully",
			data: {
				users: result.users,
				nextCursor: result.nextCursor,
				count: result.users.length,
			},
		});
	} catch (error) {
		next(error);
	}
}

async function updateUserBio(req: Request, res: Response, next: NextFunction) {
	try {
		const { bio } = updateUserBioSchema.parse(req.body);
		const { userId } = req.params;

		const user = await userRepository.updateUserBio(userId, bio);

		if (!user) {
			res.status(404).json({
				status: "ERROR",
				message: "User not found",
			});
			return;
		}

		res.json({
			status: "OK",
			message: "User bio updated successfully",
			data: { user },
		});
	} catch (error) {
		next(error);
	}
}

export default {
	listUsers,
	updateUserBio,
};
```

- [ ] **Step 2: Commit**

```bash
git add src/controller/admin.controller.ts
git commit -m "feat: add admin controller for user management"
```

---

### Task 6: Add admin routes and mount them

**Files:**
- Create: `src/routes/admin.route.ts`
- Modify: `src/routes/index.route.ts`

- [ ] **Step 1: Create admin route file**

Create `src/routes/admin.route.ts`:

```typescript
import { Router } from "express";
import adminController from "../controller/admin.controller";
import { validateUserIdParams } from "../validations/user.validation";

const router = Router();

router.get("/users", adminController.listUsers);

router.patch("/users/:userId", validateUserIdParams, adminController.updateUserBio);

export default router;
```

- [ ] **Step 2: Mount admin routes in index.route.ts**

Add the import at the top of `src/routes/index.route.ts`:

```typescript
import adminRoutes from "./admin.route";
```

Add the route mount after the slack routes line:

```typescript
router.use("/admin", authMiddleware.authenticateAdminKey, adminRoutes);
```

- [ ] **Step 3: Verify the app starts and routes are registered**

Run: `yarn dev`
Expected: App starts with no errors.

- [ ] **Step 4: Commit**

```bash
git add src/routes/admin.route.ts src/routes/index.route.ts
git commit -m "feat: add admin routes with auth middleware"
```

---

### Task 7: Manual smoke test

- [ ] **Step 1: Test auth rejection without key**

```bash
curl -s http://localhost:3000/api/admin/users | jq
```

Expected: `401 Unauthorized`

- [ ] **Step 2: Test auth rejection with wrong key**

```bash
curl -s -H "Authorization: bearer wrong-key" http://localhost:3000/api/admin/users | jq
```

Expected: `401 Unauthorized: Invalid admin API key`

- [ ] **Step 3: Test list users with valid key**

```bash
curl -s -H "Authorization: bearer YOUR_ADMIN_KEY" "http://localhost:3000/api/admin/users" | jq
```

Expected: `200` with users array, nextCursor, and count.

- [ ] **Step 4: Test search by name**

```bash
curl -s -H "Authorization: bearer YOUR_ADMIN_KEY" "http://localhost:3000/api/admin/users?search=john" | jq
```

Expected: `200` with filtered results.

- [ ] **Step 5: Test pagination**

```bash
curl -s -H "Authorization: bearer YOUR_ADMIN_KEY" "http://localhost:3000/api/admin/users?limit=2" | jq
```

Expected: `200` with 2 users and a `nextCursor` value (if more than 2 exist). Use that cursor:

```bash
curl -s -H "Authorization: bearer YOUR_ADMIN_KEY" "http://localhost:3000/api/admin/users?limit=2&cursor=CURSOR_VALUE" | jq
```

Expected: Next page of results.

- [ ] **Step 6: Test update bio**

```bash
curl -s -X PATCH -H "Authorization: bearer YOUR_ADMIN_KEY" -H "Content-Type: application/json" \
  -d '{"bio": "Runs every morning"}' \
  "http://localhost:3000/api/admin/users/USER_ID_HERE" | jq
```

Expected: `200` with updated user.

- [ ] **Step 7: Test update bio with invalid userId**

```bash
curl -s -X PATCH -H "Authorization: bearer YOUR_ADMIN_KEY" -H "Content-Type: application/json" \
  -d '{"bio": "test"}' \
  "http://localhost:3000/api/admin/users/invalid-id" | jq
```

Expected: `400` validation error.
