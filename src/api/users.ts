import { respondWithError, respondWithJSON } from "./json.js";
import { createUser, fetchUser, updateUser } from "../db/queries/users.js";
import { BadRequestError, UnauthorizedError } from "./errors.js";
import { hashPassword, checkPasswordHash, getBearerToken, makeJWT, validateJWT } from "../auth.js";
import { config } from "../config.js"
import { getUserFromRefreshToken } from "../db/queries/refresh.js";


type parameters = {
    email: string;
    password: string
};

export type User = {
    id: string,
    email: string,
    createdAt: Date,
    updatedAt: Date,
    token: string,
    isChirpyRed: boolean,
};

export type Email = {
    email: string
};

export async function handlerUsersCreate(req: any, res: any) {
    const params: parameters = req.body;

    if (!params.email) {
        throw new BadRequestError("Missing required fields");
    }

    const hashedPassword: string = await hashPassword(params.password)

    const user = await createUser({
         email: params.email,
         hashedPassword: hashedPassword,
        });

    if (!user) {
        throw new Error("Could not create user");
    }
    respondWithJSON(res, 201, {
        id: user.id,
        email: user.email,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
        isChirpyRed: user.isChirpyRed
    });
}

export async function handlerUsersUpdate(req: any, res: any) {
    const token = getBearerToken(req);
    const params: parameters = req.body;

    if (!params.email || !params.password) {
        throw new UnauthorizedError("Missing required fields");
    }

    const hashedPassword = await hashPassword(params.password);
    const userId = validateJWT(token, config.jwt.secret);
    const user = await updateUser(userId, params.email, hashedPassword);

    if (!user) {
        throw new Error("Could not update user");
    }

    const accessToken = makeJWT(user.id, config.jwt.defaultDuration, config.jwt.secret);

    const updatedUser: User = {
        id: user.id,
        email: user.email,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
        token: accessToken,
        isChirpyRed: user.isChirpyRed,
    };

    respondWithJSON(res, 200, updatedUser);
}

