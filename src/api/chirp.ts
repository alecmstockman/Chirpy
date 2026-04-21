import type { Request, Response } from "express";
import { respondWithJSON } from "./json.js";
import { BadRequestError, NotFoundError} from "./errors.js"
import { createChirp, retrieveAllChirps, retrieveChirp } from "../db/queries/chirp.js";

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

export async function handlerChirp(req: Request, res: Response) {
    type parameters = {
        body: string;
        userId: string;
    };

    const cleanedBody = validateChirp(req.body.body);

    const params: parameters = {
        body: cleanedBody,
        userId: req.body.userId
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
    console.log("RETRIEVE ALL CHIRPS")
    const chirps = await retrieveAllChirps();
    console.log(chirps)

    respondWithJSON(res, 200, chirps);
}

export async function handlerRetrieveChirp(req: Request, res: Response) {
    console.log("HANDLER RETREIVE CHIRP")
    console.log(req.params.chirpId)
    const chirpID = req.params.chirpId;
    let chirpUUID = chirpID

    if (typeof chirpID !== "string") {
        chirpUUID = chirpID[0]
    } else {
        chirpUUID = chirpID
    }

    const chirp = await retrieveChirp(chirpUUID);

    if (!chirp) {
        throw new NotFoundError(`Chirp ID: ${chirpUUID} not found`)
    }
    console.log("CHIRP")
    console.log(chirp)
    respondWithJSON(res, 200, chirp)
}
