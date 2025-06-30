import axios from "axios";
import TokenModel from "../models/token.model";
import { config } from "../../config";
import { StravaClubActivity } from "./activity.service";

type TokenResponse = {
	token_type: string;
	access_token: string;
	expires_at: number; // Unix timestamp
	expires_in: number; // seconds
	refresh_token: string;
};

async function getValidAccessToken(): Promise<string> {
	let tokens = await TokenModel.findOne(); // Get the first (and should be only) token document

	if (!tokens) {
		// No token found, call Strava API to generate a new token
		console.log("🔄 No tokens found in database, requesting new token from Strava...");
		const res = await axios.post("https://www.strava.com/api/v3/oauth/token", {
			client_id: config.STRAVA_CLIENT_ID,
			client_secret: config.STRAVA_CLIENT_SECRET,
			grant_type: "refresh_token",
			refresh_token: config.STRAVA_REFRESH_TOKEN,
		});

		const responseData: TokenResponse = res.data;

		tokens = new TokenModel({
			accessToken: responseData.access_token,
			expiresAt: new Date(responseData.expires_at * 1000),
			refreshToken: responseData.refresh_token,
		});
		await tokens.save();
		console.log("✅ New token generated and saved to database.");
	}

	// convert ms to seconds
	const now = Date.now();

	if (tokens.expiresAt.getTime() < now) {
		console.log("🔄 Access token expired — refreshing...");

		const res = await axios.post("https://www.strava.com/api/v3/oauth/token", {
			client_id: config.STRAVA_CLIENT_ID,
			client_secret: config.STRAVA_CLIENT_SECRET,
			grant_type: "refresh_token",
			refresh_token: config.STRAVA_REFRESH_TOKEN,
		});[]

		const responseData: TokenResponse = res.data;

		tokens.accessToken = responseData.access_token;
		tokens.expiresAt = new Date(responseData.expires_at * 1000);

		await tokens.save();

		console.log("✅ Token refreshed.");
	}

	return tokens.accessToken;
}

async function fetchClubActivitiesFromStrava(page: number = 1, perPage: number = 50): Promise<StravaClubActivity[]> {
	const accessToken = await getValidAccessToken();

	console.log(`🔄 Fetching club activities from Strava (page: ${page}, per_page: ${perPage})...`);

	const response = await axios.get(`https://www.strava.com/api/v3/clubs/${config.STRAVA_CLUB_ID}/activities`, {
		headers: {
			Authorization: `Bearer ${accessToken}`,
		},
		params: {
			page,
			per_page: perPage,
		},
	});

	console.log(`✅ Fetched ${response.data.length} activities from Strava`);
	return response.data;
}

export default { getValidAccessToken, fetchClubActivitiesFromStrava };
