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

// Body for PATCH /api/admin/users/:userId
export const updateUserBioSchema = z.object({
	bio: z.string().trim().max(500, "Bio must be 500 characters or less"),
});

export type TUpdateUserBio = z.infer<typeof updateUserBioSchema>;

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
