import { Request, Response } from "express";
import { NotFoundError, UnauthorizedError } from "./errors.js";
import { getUserFromRefreshToken, refreshTokenRevoke } from "../db/queries/refresh.js";
import { respondWithJSON } from "./json.js";
import { getBearerToken, makeJWT } from "../auth.js";
import { config } from "../config.js"


export async function handlerRefresh(req: Request, res: Response) {
    const cleanedToken = getBearerToken(req);
    const user = await getUserFromRefreshToken(cleanedToken);

    if (!user || !user.id) {
        throw new UnauthorizedError("invalid auth");
    }

    const newToken = makeJWT(user.id, config.jwt.defaultDuration, config.jwt.secret);

    if (!user) {
        throw new NotFoundError("user not found");
    }

    respondWithJSON(res, 200, {
        token: newToken
    });
}

export async function handlerRevoke(req: Request, res: Response) {
    const cleanedToken = getBearerToken(req);

    const revoked = await refreshTokenRevoke(cleanedToken);

    if (!revoked) {
        throw new UnauthorizedError("Unable to find token")
    }

    res.status(204).end();
}