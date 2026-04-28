import { respondWithJSON } from "../../api/json.js";
import { db } from "../index.js";
import { NewUser, users } from "../schema.js";
import { eq, asc } from "drizzle-orm";


export async function createUser(user: NewUser) {
    const [result] = await db
        .insert(users)
        .values({email: user.email, hashedPassword: user.hashedPassword})
        .onConflictDoNothing()
        .returning();

    return result;
}

export async function updateUser(userId: string, email: string, hashedPassword: string ) {    
    const currentDate = new Date();

    const [result] = await db
        .update(users)
        .set({
            email: email,
            hashedPassword: hashedPassword,
            updatedAt: currentDate,
        })
        .where(eq(users.id, userId))
        .returning()
    return result;
}

export async function fetchUser(email: string) {
    const [result] = await db
        .select()
        .from(users)
        .where(eq(users.email, email))
    return result;
    
}

export async function resetUsers() {
    try {
        await db.delete(users);
    } catch (err) {
        console.error("Error deleting users:", err);
        if (err instanceof Error) {
            console.error("cause:", (err as any).cause);
        }
    }
}

export async function upgradeUser(userId: string) {
    const currentDate = new Date();
    const [result] = await db
        .update(users)
        .set({
            isChirpyRed: true,
            updatedAt: currentDate,
        })
        .where(eq(users.id, userId))
        .returning()
    return result;
}
