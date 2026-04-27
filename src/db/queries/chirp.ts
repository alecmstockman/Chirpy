import { db } from "../index.js";
import { chirps, NewChirp } from "../schema.js";
import { eq, asc } from "drizzle-orm";


export async function createChirp(chirp: NewChirp) {
    const [result] = await db
        .insert(chirps)
        .values({ body: chirp.body, userId: chirp.userId })
        .onConflictDoNothing()
        .returning();

    return result;
}

export async function resetChirps() {
    await db.delete(chirps);
}

export async function retrieveAllChirps() {
    const result = await db
        .select()
        .from(chirps)
        .orderBy(asc(chirps.createdAt))
    return result
}

export async function retrieveChirp(chirpId: string) {
    const [result] = await db
        .select()
        .from(chirps)
        .where(eq(chirps.id, chirpId));
    return result
    
}

export async function deleteChirp(chirpId: string) {
    console.log("\n DELETE CHIRP"); 
    console.log("chirpId", chirpId)

    const [result] = await db
        .delete(chirps)
        .where(eq(chirps.id, chirpId))
        .returning();

    return result;
}
