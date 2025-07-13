import { config } from "../../config";

export function authenticateApiKey(req: any, res: any, next: any) {
	const tokenPrefix = "bearer ";
	const { authorization } = req.headers;

	if (!authorization || !authorization.toLowerCase().startsWith(tokenPrefix)) {
		return res.status(401).json({
			message: "Unauthorized: Missing or invalid authorization header",
		});
	}

	const token = authorization.slice(tokenPrefix.length).trim();

	if (token !== config.API_KEY) {
		return res.status(401).json({ message: "Unauthorized: Invalid API key" });
	}

	return next();
}

export default {
	authenticateApiKey,
};

