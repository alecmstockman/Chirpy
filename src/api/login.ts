import { Request, Response } from "express";
import { hashPassword, checkPasswordHash, getBearerToken, makeJWT } from "../auth.js";
import { UnauthorizedError } from "./errors.js";
import { respondWithError, respondWithJSON } from "./json.js";
import { fetchUser } from "../db/queries/users.js";
import { config } from "../config.js"


export async function handlerLogin(req: Request, res: Response) {
    console.log("HANDLER LOGIN")
    console.log(req.body.email)
    console.log(req.body.password)

    const email = req.body.email
    const password = req.body.password;
    const expiresIn = req.body.expiresIn

    let expirationTime = 3600000

    if (expiresIn === undefined || expiresIn > 3600000 || expiresIn <= 0) {
        expirationTime = 3600000
    } else if (expiresIn > 0 && expiresIn < 3600000) {
        expirationTime = expiresIn
    }

    const user = await fetchUser(email);

    if (!user) {
        console.log("\nNOT USER")
        respondWithError(res, 401, "incorrect email or password");
        return
    }

    const verified = await checkPasswordHash(password, user.hashedPassword);

    console.log("VERIFICATION: ", verified);

    if (verified === false) {
        respondWithError(res, 401, "incorrect email or password");
        return
    }

    const token = makeJWT(user.id, expirationTime, config.jwt.secret)

    respondWithJSON(res, 200, {
        id: user.id,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
        email: user.email,
        token: token
    });
}

