import { respondWithError, respondWithJSON } from "./json.js";
import { createUser, fetchUser } from "../db/queries/users.js";
import { BadRequestError } from "./errors.js";
import { hashPassword, checkPasswordHash } from "../auth.js";


export type User = {
    id: string,
    email: string,
    createdAt: Date,
    updatedAt: Date,
    token: string,
};

export type Email = {
    email: string
};

export async function handlerUsersCreate(req: any, res: any) {
    type parameters = {
        email: string;
        password: string
    };
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
        updatedAt: user.updatedAt
    });
}

