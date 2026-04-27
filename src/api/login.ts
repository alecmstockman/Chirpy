import { Request, Response } from "express";
import { checkPasswordHash, makeJWT } from "../auth.js";
import { respondWithError, respondWithJSON } from "./json.js";
import { fetchUser } from "../db/queries/users.js";
import { config } from "../config.js"
import { refreshTokenCreate } from "../db/queries/refresh.js";
import { UnauthorizedError } from "./errors.js";


export async function handlerLogin(req: Request, res: Response) {
    const email = req.body.email
    const password = req.body.password;
    const expiresIn = 60 * 60

    const user = await fetchUser(email);

    if (!user) {
        throw new UnauthorizedError("incorrect email or password");
    }

    const verified = await checkPasswordHash(password, user.hashedPassword);

    if (verified === false) {
        throw new UnauthorizedError("incorrect email or password");
    }

    const token = makeJWT(user.id, expiresIn, config.jwt.secret)
    const refreshToken = await refreshTokenCreate(user.id);

    respondWithJSON(res, 200, {
        id: user.id,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
        email: user.email,
        token: token,
        refreshToken: refreshToken,
        isChirpyRed: user.isChirpyRed,
    });
}

