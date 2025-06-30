import axios from "axios";
import TokenModel from "../models/token.model";
import { config } from "../../config";

async function getValidAccessToken(): Promise<string> {
	let tokens = await TokenModel.findOne(); // Get the first (and should be only) token document

	if (!tokens) {
		throw new Error("No tokens found in database. Please initialize with valid Strava tokens.");
	}

	// convert ms to seconds
	const now = Math.floor(Date.now() / 1000);

	if (tokens.expiresAt < now) {
		console.log("🔄 Access token expired — refreshing...");

		const res = await axios.post("https://www.strava.com/api/v3/oauth/token", {
			client_id: config.STRAVA_CLIENT_ID,
			client_secret: config.STRAVA_CLIENT_SECRET,
			grant_type: "refresh_token",
			refresh_token: config.STRAVA_REFRESH_TOKEN,
		});

		const responseData: {
			token_type: string;
			access_token: string;
			expires_at: number; // Unix timestamp
			expires_in: number; // seconds
			refresh_token: string;
		} = res.data;

		tokens.accessToken = responseData.access_token;
		tokens.expiresAt = responseData.expires_at;

		await tokens.save();

		console.log("✅ Token refreshed.");
	}

	return tokens.accessToken;
}

export default { getValidAccessToken };
