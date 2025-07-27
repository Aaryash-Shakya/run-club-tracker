import { TActivityWithUser } from "./activity";

export type TGroupedUserActivities = {
	user: {
		_id: string;
		firstName: string;
		lastName: string;
		bio: string | null;
		createdAt: Date;
		updatedAt: Date;
		__v: number;
	};
	activities: Omit<TActivityWithUser, "user">[];
};

export type TUser = {
	user: {
		_id: string;
		firstName: string;
		lastName: string;
		bio: string | null;
		createdAt: Date;
		updatedAt: Date;
		__v: number;
	};
};
