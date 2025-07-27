import { IUser, User } from "../models/user.model";

function listAllUsers(): Promise<IUser[]> {
	return User.find({}).sort({ firstName: 1, lastName: 1 }).lean();
}

export default {
	listAllUsers,
};
