import { respondWithError, respondWithJSON } from "./json.js";
import { createUser, fetchUser } from "../db/queries/users.js";
import { BadRequestError } from "./errors.js";
import { hashPassword, checkPasswordHash } from "../auth.js";


export type User = {
    id: string,
    email: string,
    createdAt: Date,
    updatedAt: Date,
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
    console.log("\n-----------------------------------")
    console.log("HANDLER CREATE USER")
    console.log(params.password)
    console.log(hashedPassword)

    const user = await createUser({
         email: params.email,
         hashedPassword: hashedPassword,
        });

    if (!user) {
        throw new Error("Could not create user");
    }
    console.log("handler create user json:")
    respondWithJSON(res, 201, {
        id: user.id,
        email: user.email,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt
    });
}


// export async function handlerLogin(req: any, res: any ) {
//     console.log("\n========================================")
//     console.log(" HANDLER LOGIN - USERS")
//     console.log(req.params.body)
//     console.log("========================================\n")

//     type parameters = {
//         email: string;
//         password: string
//     };
//     const params: parameters = req.body;

//     if (!params.email) {
//         throw new BadRequestError("Missing required fields");
//     }

//     const hashedPassword: string = await hashPassword(params.password)

//     const user = await fetchUser(params.email);

//     if (!user) {
//         respondWithError(res, 401, "incorrect email or password")
//     }

//     const verification = await checkPasswordHash(user.hashedPassword, hashedPassword)

//     console.log("VERIFICATION: ", verification)

//     if (verification === false) {
//         respondWithError(res, 401, "incorrect email or password")
//     }

//     console.log("---------");
//     console.log(user)
    
//     respondWithJSON(res, 200, {
//         id: user.id,
//         createdAt: user.createdAt,
//         updatedAt: user.updatedAt,
//         email: user.email
//     });

// } 
