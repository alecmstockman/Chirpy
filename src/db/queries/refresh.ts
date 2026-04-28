import { refreshTokens, NewRefreshToken, NewUser, users } from "../schema.js";
import { eq, and, gt, isNull } from "drizzle-orm";
import { db } from "../index.js";
import { makeRefreshToken } from "../../auth.js";


export async function refreshTokenCreate(userID: string) {
    const refreshToken = makeRefreshToken();
    const issuedAt = Date.now();
    const expiresIn = 60 * 24 * 60 * 60 * 1000;
    const expiresAt = issuedAt + expiresIn;
    const expiresAtDate = new Date(expiresAt);

    const token: NewRefreshToken = {
        token: refreshToken,
        userId: userID,
        expiresAt: expiresAtDate,
    };

    const [result] = await db
            .insert(refreshTokens)
            .values({
                token: token.token,
                userId: token.userId,
                expiresAt: token.expiresAt,                
            })
            .onConflictDoNothing()
            .returning();
    
    return result.token;
}

export async function getUserFromRefreshToken(token: string) {
    const now = new Date();

    const [result] = await db
        .select({user: users})
        .from(refreshTokens)
        .innerJoin(users, eq(refreshTokens.userId, users.id))
        .where(
            and(
                eq(refreshTokens.token, token), 
                gt(refreshTokens.expiresAt, now),
                isNull(refreshTokens.revokedAt)
            ),
        );
    
    const user = result?.user;
    return user;
}

export async function refreshTokenRevoke(token: string) {
    const revokedAt = new Date(Date.now());

    const [result] = await db
        .update(refreshTokens)
        .set({
            revokedAt: revokedAt,
            updatedAt: revokedAt
        })
        .where(eq(refreshTokens.token, token))
        .returning();
    
    return result;
}