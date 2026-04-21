import { respondWithJSON } from "../../api/json.js";
import { db } from "../index.js";
import { NewUser, users } from "../schema.js";
import { eq, asc } from "drizzle-orm";


export async function createUser(user: NewUser) {
    console.log("\n------------------------------");
    console.log("CREATE USER")
    console.log(user);

    const [result] = await db
        .insert(users)
        .values({email: user.email, hashedPassword: user.hashedPassword})
        .onConflictDoNothing()
        .returning();

    return result;
}


export async function fetchUser(email: string) {
    console.log("\n------------------------------")
    console.log("fetchUser");

    const [result] = await db
        .select()
        .from(users)
        .where(eq(users.email, email))
    return result;
    
}


export async function resetUsers() {
    console.log("\n---------------------------------------")
    console.log("reset users")
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
