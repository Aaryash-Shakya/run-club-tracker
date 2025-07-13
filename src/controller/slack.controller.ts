import { Request, Response, NextFunction } from "express";
import slackService from "../services/slack.service";

async function sendMessageToSlack(req: Request, res: Response, next: NextFunction): Promise<void> {
	try {
		const { channelName, message } = req.body as { channelName?: string; message?: string };
		if (!channelName || !message) {
			res.status(400).json({
				status: "error",
				message: "Channel name and message are required",
			});
			return;
		}
		console.log(`📬 Sending message to channel: ${channelName}`);
		const result = await slackService.sendMessage(channelName, message);
		res.json({
			status: "OK",
			message: "Message sent successfully",
			result,
		});
	} catch (error) {
		console.error("❌ Error sending message:", error);
		res.status(500).json({
			status: "error",
			message: "Failed to send message",
			error: error instanceof Error ? error.message : "Unknown error",
		});
	}
}

async function updateMessage(req: Request, res: Response, next: NextFunction): Promise<void> {
	try {
		const { channelId, ts, message } = req.body as {
			channelId?: string;
			ts?: string;
			message?: string;
		};
		if (!channelId || !ts || !message) {
			res.status(400).json({
				status: "error",
				message: "Channel ID, ts, and message are required",
			});
			return;
		}
		console.log(`✏️ Updating message in channel: ${channelId}, ts: ${ts}`);
		const result = await slackService.updateMessage(channelId, ts, message);
		res.json({
			status: "OK",
			message: "Message updated successfully",
			result,
		});
	} catch (error) {
		console.error("❌ Error updating message:", error);
		res.status(500).json({
			status: "error",
			message: "Failed to update message",
			error: error instanceof Error ? error.message : "Unknown error",
		});
	}
}

export default {
	sendMessageToSlack,
	updateMessage,
};
