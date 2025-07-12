import { retryPolicies, WebClient } from "@slack/web-api";
import { config } from "../../config";

const client = new WebClient(config.SLACK_BOT_TOKEN, {
	retryConfig: retryPolicies.fiveRetriesInFiveMinutes,
});

async function sendMessage(channelName: string, message: string) {
	try {
		const result = await client.chat.postMessage({
			channel: channelName,
			text: message,
			username: "Stride Bot",
			icon_url: "https://imgur.com/a/kkdV1IM",
			// or use icon_emoji instead:
			// icon_emoji: ":running_shoe:",
		});

		console.log("Message sent successfully:", result.ts);
		return result;
	} catch (error) {
		console.error("Error sending message to Slack:", error);
		throw error;
	}
}

async function updateMessage(channelId: string, ts: string, message: string) {
	try {
		const result = await client.chat.update({
			channel: channelId,
			ts,
			text: message,
		});

		console.log("Message updated successfully:", result.ts);
		return result;
	} catch (error) {
		console.error("Error updating message in Slack:", error);
		throw error;
	}
}

export default {
	sendMessage,
	updateMessage,
};

