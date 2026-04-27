import type { Request, Response } from "express";
import { respondWithJSON } from "./json.js";
import { BadRequestError, NotFoundError, UnauthorizedError, UserForbiddenError} from "./errors.js"
import { upgradeUser } from "../db/queries/users.js";
import { getAPIKey } from "../auth.js";
import { config } from "../config.js";


export async function handlerUpgradeuser(req: Request, res: Response) {
    type webhooks = {
        event: string;
        data: {
            userId: string
        }
    };

    console.log("\n---------------- HANDLER UPGRADE USER ------------------")

    const apiKey = getAPIKey(req);
    console.log("apiKey", apiKey);
    console.log("config", config.polka.apiKey)
    
    if (apiKey !== config.polka.apiKey) {
        throw new UnauthorizedError("invalid username or password");
    }

    const webhook: webhooks = req.body;
    console.log("webhook", webhook)

    if (webhook.event !== "user.upgraded") {
        res.status(204).send();
        return
    }

    const userId = webhook.data.userId;
    console.log("userId", userId)

    const upgradedUser = await upgradeUser(userId);
    console.log("upgraded User", upgradeUser)

    if (!upgradeUser) {
        throw new NotFoundError("user not found")
    }

    console.log("sending 204")
    respondWithJSON(res, 204, upgradedUser);
}