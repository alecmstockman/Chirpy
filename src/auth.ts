import * as argon2 from "argon2";
import { Request } from "express";
import jwt from "jsonwebtoken";
import { JwtPayload } from "jsonwebtoken"
import { UnauthorizedError } from "./api/errors.js";
import crypto from "crypto";


type payload = Pick<JwtPayload, "iss" | "sub" | "iat" | "exp">;

const TOKEN_ISSUER = "chirpy";

export async function hashPassword(password: string): Promise<string> {
    try {
        const hash = await argon2.hash(password);
        return hash;
    } catch (err) {
        throw new Error("Hashing failed");
    }
}

export async function checkPasswordHash(password: string, hash: string): Promise<boolean> {
    if (await argon2.verify(hash, password)) {
        return true;
    } else {
        return false;
    }
}

export function makeJWT(userID: string, expiresIn: number, secret: string): string {
    const issuedAt = Math.floor(Date.now() / 1000);
    const expiresAt = issuedAt + expiresIn
    const token = jwt.sign(
        {
            iss: TOKEN_ISSUER,
            sub: userID,
            iat: issuedAt,
            exp: expiresAt
        } satisfies payload,
        secret,
        { algorithm: "HS256" }
    );
    return token;
};

export function validateJWT(tokenString: string, secret: string): string {
        let token: jwt.JwtPayload | string;

        try {
            token = jwt.verify(tokenString, secret);
        } catch (e) {
            throw new UnauthorizedError("invalid token");
        }
        
        if (typeof token === "string") {
            throw new UnauthorizedError("invalid token");
        }

        if (token.iss !== TOKEN_ISSUER) {
            throw new UnauthorizedError("invalid issuer");
        }
        if (!token.sub) {
            throw new UnauthorizedError("Token missing sub information");
        }

        return token.sub;
}

export function getBearerToken(req: Request): string {
    const auth = req.get("authorization");

    if (!auth) {
        throw new UnauthorizedError("invalid auth")
    }

    const splitAuth = auth.split(" ")
    const cleanedAuth = splitAuth[1].trim()
    return cleanedAuth;
}

export function makeRefreshToken() {
    const randomrData = crypto.randomBytes(32);
    const token = randomrData.toString("hex");
    return token;
}