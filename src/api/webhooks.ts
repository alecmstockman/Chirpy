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

    const apiKey = getAPIKey(req);
    
    if (apiKey !== config.polka.apiKey) {
        throw new UnauthorizedError("invalid username or password");
    }

    const webhook: webhooks = req.body;

    if (webhook.event !== "user.upgraded") {
        res.status(204).send();
        return
    }

    const userId = webhook.data.userId;
    const upgradedUser = await upgradeUser(userId);

    if (!upgradeUser) {
        throw new NotFoundError("user not found")
    }
    respondWithJSON(res, 204, upgradedUser);
}