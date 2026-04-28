import type { Request, Response } from "express";
import { respondWithJSON } from "./json.js";
import { BadRequestError, NotFoundError, UnauthorizedError, UserForbiddenError} from "./errors.js"
import { createChirp, retrieveAllChirps, retrieveChirp, deleteChirp } from "../db/queries/chirp.js";
import { getBearerToken, validateJWT } from "../auth.js";
import { config } from "../config.js"


function validateChirp(text: string) {
    const maxChirpLength = 140;

    if (text.length > maxChirpLength) {
        throw new BadRequestError("Chirp is too long");
    }

    const words = text.split(" ");

    const badWords = ["kerfuffle", "sharbert", "fornax"];
    for (let i = 0; i < words.length; i++) {
        const word = words[i];
        const loweredWord = word.toLocaleLowerCase();
        if (badWords.includes(loweredWord)) {
            words[i] == "****";
        }
    }

    const cleaned = words.join(" ");
    return cleaned;
}

type parameters = {
    body: string;
    userId: string;
};

export async function handlerChirp(req: Request, res: Response) {

    const tokenString = getBearerToken(req);
    const secret = config.jwt.secret;
    const userID = validateJWT(tokenString, secret);
    const cleanedBody = validateChirp(req.body.body);

    const params: parameters = {
        body: cleanedBody,
        userId: userID
    };

    if (!params.body || !params.userId) {
        throw new BadRequestError("Missing required fields");
    }
    
    const chirp = await createChirp({
        body: params.body,
        userId: params.userId
    });

    if (!chirp) {
        throw new Error("Could not create chirp");
    }

    respondWithJSON(res, 201, {
        id: chirp.id,
        createdAt: chirp.createdAt,
        updatedAt: chirp.updatedAt,
        body: chirp.body,
        userId: chirp.userId,
    });
}

export async function handlerRetrieveAllChirps(req: Request, res: Response) {
    let authorId = "";
    let authorIdQuery = req.query.authorId;
    let sortOrder = "";
    let sortQuery = req.query.sort;

    console.log("sortIdQuery", sortQuery);
    console.log("sortAuthorQuery", authorIdQuery)

    if (typeof authorIdQuery === "string") {
        authorId = authorIdQuery;
    }
    if (typeof sortQuery === "string") {
        sortOrder = sortQuery;
    }

    const chirps = await retrieveAllChirps(authorId, sortOrder);
    respondWithJSON(res, 200, chirps)

}

export async function handlerRetrieveChirp(req: Request, res: Response) {
    console.log("\n -------- HANDLER RETRIEVE CHIRP -------")
    const chirpId = req.params.chirpId;
    let chirpUUID = chirpId

    if (typeof chirpId !== "string") {
        chirpUUID = chirpId[0]
    } else {
        chirpUUID = chirpId
    }

    const chirp = await retrieveChirp(chirpUUID);

    if (!chirp) {
        throw new NotFoundError(`Chirp ID: ${chirpUUID} not found`)
    }

    respondWithJSON(res, 200, chirp)
}

export async function handlerDeleteChirp(req: Request, res: Response) {
    console.log("\n----------- HANDLER DELETE CHIRP -------------");
    const tokenString = getBearerToken(req);
    console.log("token: ", tokenString);
    const secret = config.jwt.secret;
    const userId = validateJWT(tokenString, secret);
    console.log("userId", userId)
    const chirpId = req.params.chirpId;
    console.log("chirpId", chirpId)

    let chirpUUID = chirpId

    if (typeof chirpId !== "string") {
        chirpUUID = chirpId[0];
    } else {
        chirpUUID = chirpId;
    }

    const chirp = await retrieveChirp(chirpUUID);

    if (chirp.userId !== userId) {
        throw new UserForbiddenError("User is not author of this chirp");
    }

    const deletedChirp = await deleteChirp(chirpUUID);

    console.log('HANDLER DELETE CHIRP');
    console.log(deletedChirp)

    if (!deletedChirp) {
        throw new NotFoundError("chirp not found");
    }


    res.status(204).send();
}
