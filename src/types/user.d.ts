import { TActivityWithUser } from "./activity";

export type TGroupedUserActivities = {
	user: {
		_id: string;
		firstName: string;
		lastName: string;
		createdAt: Date;
		updatedAt: Date;
		__v: number;
	};
	activities: Omit<TActivityWithUser, "user">[];
};

