import axios from "axios";
import dotenv from "dotenv";
import TokenModel from "../models/token.model";

dotenv.config();

export async function getValidAccessToken(): Promise<string> {
	let tokens = await TokenModel.findOne(); // Get the first (and should be only) token document

	if (!tokens) {
		throw new Error("No tokens found in database. Please initialize with valid Strava tokens.");
	}

	// convert ms to seconds
	const now = Math.floor(Date.now() / 1000);

	if (tokens.expires_at < now) {
		console.log("🔄 Access token expired — refreshing...");

		const res = await axios.post("https://www.strava.com/api/v3/oauth/token", {
			client_id: process.env.STRAVA_CLIENT_ID,
			client_secret: process.env.STRAVA_CLIENT_SECRET,
			grant_type: "refresh_token",
			refresh_token: process.env.STRAVA_REFRESH_TOKEN,
		});

		const responseData: {
			token_type: string;
			access_token: string;
			expires_at: number; // Unix timestamp
			expires_in: number; // seconds
			refresh_token: string;
		} = res.data;

		tokens.access_token = responseData.access_token;
		tokens.expires_at = responseData.expires_at;

		await tokens.save();

		console.log("✅ Token refreshed.");
	}

	return tokens.access_token;
}
