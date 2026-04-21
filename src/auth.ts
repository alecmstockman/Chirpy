import * as argon2 from "argon2";
import jwt from "jsonwebtoken";
import { JwtPayload } from "jsonwebtoken"
import { UnauthorizedError } from "./api/errors.js";


type payload = Pick<JwtPayload, "iss" | "sub" | "iat" | "exp">;

export function makeJWT(userID: string, expiresIn: number, secret: string): string {
    
    const currentTime = Math.floor(Date.now() / 1000);

    const jwtPayload: payload = {
        iss: "chirpy",
        sub: userID,
        iat: currentTime,
        exp: currentTime + expiresIn,
    };

    return jwt.sign(jwtPayload, secret);
};


export function validateJWT(tokenString: string, secret: string): string {
    const unverifiedToken = jwt.verify(tokenString, secret);

    if (!unverifiedToken) {
        throw new UnauthorizedError("token is invalid");
    }

    const token = JSON.stringify(unverifiedToken);
    
    return token;
}

export async function hashPassword(password: string): Promise<string> {
    try {
        const hash = await argon2.hash(password);
        console.log("returning hash")
        return hash;
    } catch (err) {
        throw new Error("Hashing failed");
    }
}

export async function checkPasswordHash(password: string, hash: string): Promise<boolean> {
    console.log("CHECK PASSWORD HASH");
    console.log("password:", password);
    console.log("hash", hash)
    if (await argon2.verify(hash, password)) {
        return true;
    } else {
        return false;
    }
}