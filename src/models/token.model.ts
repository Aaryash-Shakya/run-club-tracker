import mongoose, { Document, Schema } from "mongoose";

export interface IToken extends Document {
	access_token: string;
	expires_at: number; // Unix timestamp
	createdAt: Date;
	updatedAt: Date;
}

const tokenSchema = new Schema<IToken>(
	{
		access_token: {
			type: String,
			required: true,
		},
		expires_at: {
			type: Number,
			required: true,
		},
	},
	{
		timestamps: true,
		collection: "tokens",
	}
);

const TokenModel = mongoose.model<IToken>("Token", tokenSchema);

export default TokenModel;
