import dotenv from "dotenv";
import { cleanEnv, str, num } from "envalid";

// Load .env
dotenv.config();

// Validate and export typed config
export const config = cleanEnv(process.env, {
	MONGODB_URI: str(),
	STRAVA_CLUB_ID: num(),
	STRAVA_CLIENT_ID: num(),
	STRAVA_CLIENT_SECRET: str(),
	STRAVA_REFRESH_TOKEN: str(),
	SLACK_BOT_TOKEN: str(),
	SLACK_CHANNEL_NAME: str(),
	API_KEY: str(),
});
