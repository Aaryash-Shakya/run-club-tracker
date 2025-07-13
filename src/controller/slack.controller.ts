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
		const result = await slackService.sendMessage(message, channelName);
		res.json({
			status: "OK",
			message: "Message sent successfully",
			result,
		});
	} catch (error) {
		next(error);
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
		next(error);
	}
}

export default {
	sendMessageToSlack,
	updateMessage,
};
