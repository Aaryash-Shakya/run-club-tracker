import mongoose, { Document, Schema } from "mongoose";

export interface IToken extends Document {
	accessToken: string;
	expiresAt: Date; // Unix timestamp
	createdAt: Date;
	updatedAt: Date;
}

const tokenSchema = new Schema<IToken>(
	{
		accessToken: {
			type: String,
			required: true,
		},
		expiresAt: {
			type: Date,
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
