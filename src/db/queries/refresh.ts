import { refreshTokens, RefreshToken } from "../schema.js";
import { eq, asc } from "drizzle-orm";
import { db } from "../index.js";


export async function refreshTokenLookUp(refreshToken: string) {
    const [result] = await db
        .select()
        .from(refreshTokens)
        .where(eq(refreshTokens.token, refreshToken));

    return result;
}