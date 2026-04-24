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
    console.log("delete successful")
}
