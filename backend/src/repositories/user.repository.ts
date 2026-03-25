import { Types } from "mongoose";
import { IUser, User } from "../models/user.model";

function listAllUsers(): Promise<IUser[]> {
	return User.find({}).sort({ firstName: 1, lastName: 1 }).lean();
}

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

export default {
	listAllUsers,
	searchUsers,
	updateUserBio,
};
