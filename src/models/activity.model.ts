import { Schema, model, Document } from "mongoose";

export interface IActivity extends Document {
	name: string;
	distance: number;
	moving_time: number;
	elapsed_time: number;
	total_elevation_gain: number;
	type: string;
	sport_type: string;
	workout_type: number;
}

const ActivitySchema = new Schema<IActivity>({
	name: { type: String, required: true },
	distance: { type: Number, required: true },
	moving_time: { type: Number, required: true },
	elapsed_time: { type: Number, required: true },
	total_elevation_gain: { type: Number, required: true },
	type: { type: String, required: true },
	sport_type: { type: String, required: true },
	workout_type: { type: Number, required: true },
});

export const Activity = model<IActivity>("Activity", ActivitySchema);
