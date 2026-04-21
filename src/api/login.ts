import { Request, Response } from "express";
import { hashPassword, checkPasswordHash } from "../auth.js";
import { UnauthorizedError } from "./errors.js";
import { respondWithError, respondWithJSON } from "./json.js";
import { fetchUser } from "../db/queries/users.js";


export async function handlerLogin(req: Request, res: Response) {
    console.log("HANDLER LOGIN")
    console.log(req.body.email)
    console.log(req.body.password)

    const email = req.body.email
    const password = await req.body.password;

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

    respondWithJSON(res, 200, {
        id: user.id,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
        email: user.email
    });
}

