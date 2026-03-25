# Admin Challenge & Participant Routes Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add admin API routes for creating challenges (start/end date) and managing participants (add/remove users from challenges).

**Architecture:** Extends the existing admin route group (`/api/admin/*`) behind `authenticateAdminKey`. Adds a challenge repository for CRUD, a participant repository for add/remove, new Zod validation schemas, and new controller handlers. Reuses the existing Challenge and Participant Mongoose models as-is — no schema changes needed.

**Tech Stack:** TypeScript, Express 5, Mongoose, Zod, envalid

---

## File Map

| Action | File | Responsibility |
|--------|------|----------------|
| Create | `src/repositories/participant.repository.ts` | Add/remove/list participants for a challenge |
| Modify | `src/repositories/challenge.repository.ts` | Add createChallenge, listChallenges, findChallengeById |
| Modify | `src/validations/admin.validation.ts` | Add Zod schemas for challenge creation, participant add/remove, challengeId param |
| Modify | `src/controller/admin.controller.ts` | Add challenge + participant handler functions |
| Modify | `src/routes/admin.route.ts` | Add challenge + participant routes |

---

### Task 1: Add challenge repository methods

**Files:**
- Modify: `src/repositories/challenge.repository.ts`

- [ ] **Step 1: Add createChallenge, listChallenges, and findChallengeById**

Update `src/repositories/challenge.repository.ts` to add the new functions. Add the `Types` import for ObjectId:

```typescript
import { Types } from "mongoose";
import Challenge, { IChallenge } from "../models/challenge.model";

async function findChallenge(date: Date): Promise<IChallenge | null> {
	return Challenge.findOne({
		startDate: { $lte: date },
		endDate: { $gte: date },
	})
		.sort({ startDate: -1 })
		.lean()
		.exec();
}

interface CreateChallengeInput {
	name: string;
	description?: string;
	startDate: Date;
	endDate: Date;
	targetKm: number;
	maxRunPace?: number;
	minWalkingDistance?: number;
	minRunningDistance?: number;
}

async function createChallenge(input: CreateChallengeInput): Promise<IChallenge> {
	const challenge = new Challenge(input);
	return challenge.save();
}

async function listChallenges(): Promise<IChallenge[]> {
	return Challenge.find({}).sort({ startDate: -1 }).lean();
}

async function findChallengeById(id: string): Promise<IChallenge | null> {
	if (!Types.ObjectId.isValid(id)) return null;
	return Challenge.findById(id).lean();
}

export default {
	findChallenge,
	createChallenge,
	listChallenges,
	findChallengeById,
};
```

- [ ] **Step 2: Commit**

```bash
git add src/repositories/challenge.repository.ts
git commit -m "feat: add challenge CRUD methods to repository"
```

---

### Task 2: Add participant repository

**Files:**
- Create: `src/repositories/participant.repository.ts`

- [ ] **Step 1: Create participant repository**

Create `src/repositories/participant.repository.ts`:

```typescript
import { Participant, IParticipant } from "../models/participant.model";

async function addParticipant(userId: string, challengeId: string): Promise<IParticipant> {
	const participant = new Participant({
		user: userId,
		challenge: challengeId,
	});
	return participant.save();
}

async function removeParticipant(userId: string, challengeId: string): Promise<IParticipant | null> {
	return Participant.findOneAndDelete({ user: userId, challenge: challengeId });
}

async function listParticipants(challengeId: string): Promise<IParticipant[]> {
	return Participant.find({ challenge: challengeId }).populate("user").lean();
}

export default {
	addParticipant,
	removeParticipant,
	listParticipants,
};
```

- [ ] **Step 2: Commit**

```bash
git add src/repositories/participant.repository.ts
git commit -m "feat: add participant repository for add/remove/list"
```

---

### Task 3: Add validation schemas for challenges and participants

**Files:**
- Modify: `src/validations/admin.validation.ts`

- [ ] **Step 1: Add new Zod schemas**

Add the following schemas after the existing `updateUserBioSchema` in `src/validations/admin.validation.ts`:

```typescript
// Reusable MongoDB ObjectId string schema
export const mongoIdParamSchema = z.object({
	challengeId: z
		.string()
		.trim()
		.regex(/^[0-9a-fA-F]{24}$/, "Invalid MongoDB ObjectId format"),
});

export type TChallengeIdParam = z.infer<typeof mongoIdParamSchema>;

// Body for POST /api/admin/challenges
export const createChallengeSchema = z
	.object({
		name: z.string().trim().min(1, "Name is required").max(200),
		description: z.string().trim().max(1000).optional(),
		startDate: z.coerce.date(),
		endDate: z.coerce.date(),
		targetKm: z.number().positive("Target must be positive"),
		maxRunPace: z.number().positive().optional(),
		minWalkingDistance: z.number().min(0).optional(),
		minRunningDistance: z.number().min(0).optional(),
	})
	.refine((data) => data.endDate > data.startDate, {
		message: "End date must be after start date",
		path: ["endDate"],
	});

export type TCreateChallenge = z.infer<typeof createChallengeSchema>;

// Body for POST /api/admin/challenges/:challengeId/participants
export const addParticipantSchema = z.object({
	userId: z
		.string()
		.trim()
		.regex(/^[0-9a-fA-F]{24}$/, "Invalid userId format"),
});

export type TAddParticipant = z.infer<typeof addParticipantSchema>;

// Body for DELETE /api/admin/challenges/:challengeId/participants
export const removeParticipantSchema = z.object({
	userId: z
		.string()
		.trim()
		.regex(/^[0-9a-fA-F]{24}$/, "Invalid userId format"),
});

export type TRemoveParticipant = z.infer<typeof removeParticipantSchema>;
```

Also remove the unused private `mongoIdSchema` (lines 15-19) since we now have the exported `mongoIdParamSchema`.

- [ ] **Step 2: Commit**

```bash
git add src/validations/admin.validation.ts
git commit -m "feat: add Zod schemas for challenge and participant routes"
```

---

### Task 4: Add admin controller handlers for challenges and participants

**Files:**
- Modify: `src/controller/admin.controller.ts`

- [ ] **Step 1: Add imports and handler functions**

Update imports at the top of `src/controller/admin.controller.ts`:

```typescript
import { Request, Response, NextFunction } from "express";
import {
	adminUserListQuerySchema,
	updateUserBioSchema,
	createChallengeSchema,
	mongoIdParamSchema,
	addParticipantSchema,
	removeParticipantSchema,
} from "../validations/admin.validation";
import userRepository from "../repositories/user.repository";
import challengeRepository from "../repositories/challenge.repository";
import participantRepository from "../repositories/participant.repository";
```

Add the following functions after the existing `updateUserBio` function:

```typescript
async function createChallenge(req: Request, res: Response, next: NextFunction) {
	try {
		const data = createChallengeSchema.parse(req.body);
		const challenge = await challengeRepository.createChallenge(data);

		res.status(201).json({
			status: "OK",
			message: "Challenge created successfully",
			data: { challenge },
		});
	} catch (error) {
		next(error);
	}
}

async function listChallenges(req: Request, res: Response, next: NextFunction) {
	try {
		const challenges = await challengeRepository.listChallenges();

		res.json({
			status: "OK",
			message: "Challenges fetched successfully",
			data: { challenges, count: challenges.length },
		});
	} catch (error) {
		next(error);
	}
}

async function addParticipant(req: Request, res: Response, next: NextFunction) {
	try {
		const { challengeId } = mongoIdParamSchema.parse(req.params);
		const { userId } = addParticipantSchema.parse(req.body);

		const challenge = await challengeRepository.findChallengeById(challengeId);
		if (!challenge) {
			res.status(404).json({ status: "ERROR", message: "Challenge not found" });
			return;
		}

		const participant = await participantRepository.addParticipant(userId, challengeId);

		res.status(201).json({
			status: "OK",
			message: "Participant added successfully",
			data: { participant },
		});
	} catch (error) {
		if (error instanceof Error && "code" in error && (error as any).code === 11000) {
			res.status(409).json({
				status: "ERROR",
				message: "User is already a participant in this challenge",
			});
			return;
		}
		next(error);
	}
}

async function removeParticipant(req: Request, res: Response, next: NextFunction) {
	try {
		const { challengeId } = mongoIdParamSchema.parse(req.params);
		const { userId } = removeParticipantSchema.parse(req.body);

		const removed = await participantRepository.removeParticipant(userId, challengeId);

		if (!removed) {
			res.status(404).json({
				status: "ERROR",
				message: "Participant not found in this challenge",
			});
			return;
		}

		res.json({
			status: "OK",
			message: "Participant removed successfully",
		});
	} catch (error) {
		next(error);
	}
}

async function listParticipants(req: Request, res: Response, next: NextFunction) {
	try {
		const { challengeId } = mongoIdParamSchema.parse(req.params);

		const challenge = await challengeRepository.findChallengeById(challengeId);
		if (!challenge) {
			res.status(404).json({ status: "ERROR", message: "Challenge not found" });
			return;
		}

		const participants = await participantRepository.listParticipants(challengeId);

		res.json({
			status: "OK",
			message: "Participants fetched successfully",
			data: { participants, count: participants.length },
		});
	} catch (error) {
		next(error);
	}
}
```

Update the default export:

```typescript
export default {
	listUsers,
	updateUserBio,
	createChallenge,
	listChallenges,
	addParticipant,
	removeParticipant,
	listParticipants,
};
```

- [ ] **Step 2: Commit**

```bash
git add src/controller/admin.controller.ts
git commit -m "feat: add admin controller handlers for challenges and participants"
```

---

### Task 5: Add admin routes for challenges and participants

**Files:**
- Modify: `src/routes/admin.route.ts`

- [ ] **Step 1: Add new routes**

Update `src/routes/admin.route.ts`:

```typescript
import { Router } from "express";
import adminController from "../controller/admin.controller";
import { validateUserIdParams } from "../validations/user.validation";

const router = Router();

// User management
router.get("/users", adminController.listUsers);
router.patch("/users/:userId", validateUserIdParams, adminController.updateUserBio);

// Challenge management
router.post("/challenges", adminController.createChallenge);
router.get("/challenges", adminController.listChallenges);

// Participant management
router.post("/challenges/:challengeId/participants", adminController.addParticipant);
router.delete("/challenges/:challengeId/participants", adminController.removeParticipant);
router.get("/challenges/:challengeId/participants", adminController.listParticipants);

export default router;
```

- [ ] **Step 2: Verify the app compiles**

Run: `npx tsc --noEmit`
Expected: No errors.

- [ ] **Step 3: Run lint**

Run: `yarn lint`
Expected: No new errors.

- [ ] **Step 4: Commit**

```bash
git add src/routes/admin.route.ts
git commit -m "feat: add admin routes for challenge and participant management"
```

---

### Task 6: Manual smoke test

- [ ] **Step 1: Test create challenge**

```bash
curl -s -X POST -H "Authorization: bearer YOUR_ADMIN_KEY" -H "Content-Type: application/json" \
  -d '{"name":"April Challenge","startDate":"2026-04-01","endDate":"2026-04-30","targetKm":100}' \
  "http://localhost:8000/api/admin/challenges" | jq
```

Expected: `201` with challenge object.

- [ ] **Step 2: Test list challenges**

```bash
curl -s -H "Authorization: bearer YOUR_ADMIN_KEY" "http://localhost:8000/api/admin/challenges" | jq
```

Expected: `200` with challenges array.

- [ ] **Step 3: Test add participant**

```bash
curl -s -X POST -H "Authorization: bearer YOUR_ADMIN_KEY" -H "Content-Type: application/json" \
  -d '{"userId":"USER_ID_HERE"}' \
  "http://localhost:8000/api/admin/challenges/CHALLENGE_ID_HERE/participants" | jq
```

Expected: `201` with participant object.

- [ ] **Step 4: Test list participants**

```bash
curl -s -H "Authorization: bearer YOUR_ADMIN_KEY" \
  "http://localhost:8000/api/admin/challenges/CHALLENGE_ID_HERE/participants" | jq
```

Expected: `200` with participants array (user populated).

- [ ] **Step 5: Test remove participant**

```bash
curl -s -X DELETE -H "Authorization: bearer YOUR_ADMIN_KEY" -H "Content-Type: application/json" \
  -d '{"userId":"USER_ID_HERE"}' \
  "http://localhost:8000/api/admin/challenges/CHALLENGE_ID_HERE/participants" | jq
```

Expected: `200` with success message.

- [ ] **Step 6: Test duplicate participant (409)**

Re-add the same participant, then add again:

Expected: `409 Conflict` — "User is already a participant in this challenge".

- [ ] **Step 7: Test validation — endDate before startDate**

```bash
curl -s -X POST -H "Authorization: bearer YOUR_ADMIN_KEY" -H "Content-Type: application/json" \
  -d '{"name":"Bad Challenge","startDate":"2026-04-30","endDate":"2026-04-01","targetKm":100}' \
  "http://localhost:8000/api/admin/challenges" | jq
```

Expected: Validation error about endDate.
