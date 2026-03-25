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
