import { Types } from "mongoose";

export type TActivity = {
	_id: Types.ObjectId | string;
	name: string;
	distance: number;
	movingTime: number;
	elapsedTime: number;
	totalElevationGain: number;
	movingPace: number;
	type: string;
	sportType: string;
	workoutType: number;
	activityDate: string;
	isValid: boolean;
	note: string | null;
	user: Types.ObjectId | string;
	__v: number;
	createdAt: Date;
	updatedAt: Date;
};

export type TActivityWithUser = {
	_id: Types.ObjectId | string;
	name: string;
	distance: number;
	movingTime: number;
	elapsedTime: number;
	totalElevationGain: number;
	movingPace: number;
	type: string;
	sportType: string;
	workoutType: number;
	activityDate: Date;
	isValid: boolean;
	note: string | null;
	user: {
		_id: Types.ObjectId | string;
		firstName: string;
		lastName: string;
		createdAt: Date;
		updatedAt: Date;
		__v: number;
	};
	__v: number;
	createdAt: Date;
	updatedAt: Date;
};

