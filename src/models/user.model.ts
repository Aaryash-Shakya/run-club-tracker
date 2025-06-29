import { Schema, model, Document } from "mongoose";

export interface IUser extends Document {
	id: string;
	firstname: string;
	lastname: string;
	createdAt: Date;
	updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
	{
		id: { type: String, required: true, unique: true },
		firstname: { type: String, required: true },
		lastname: { type: String, required: true },
	},
	{
		timestamps: true,
		collection: "users",
	}
);

export const User = model<IUser>("User", UserSchema);
