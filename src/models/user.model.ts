import { Schema, model, Document } from "mongoose";

export interface IUser extends Document {
	id: string;
	firstName: string;
	lastName: string;
	createdAt: Date;
	updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
	{
		id: { type: String, required: true, unique: true },
		firstName: { type: String, required: true },
		lastName: { type: String, required: true },
	},
	{
		timestamps: true,
		collection: "users",
	}
);

export const User = model<IUser>("User", UserSchema);
