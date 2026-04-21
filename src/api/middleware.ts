import { Request, Response, NextFunction } from "express";
import { config } from "../config.js";
import { respondWithError } from "./json.js";
import { NotFoundError, UnauthorizedError, UserForbiddenError, BadRequestError} from "./errors.js"

export function middlewareLogResponses(req: Request, res: Response, next: NextFunction) {
    const statusCode = res.statusCode;

    res.on("finish", () => {
        if (statusCode >= 300) {
            console.log(`[NON-OK] ${req.method} ${req.url} - Status: ${statusCode}`)
        }
    });
    next();
}

export function middlewareMetricsInc(req: Request, res: Response, next: NextFunction) {
    config
    .api.fileserverHits++;
    next();
}

export function middlewareReadRequestBody(req: Request) {
    let reqBody = "";
        req.on("data", (chunk) => {
            reqBody += chunk;
        });
}

export function errorMiddleware(err: Error, req: Request, res: Response, next: NextFunction) {
    
    let statusCode = 500;
    let message = "Something went wrong on our end";

    if (err instanceof BadRequestError) {
        statusCode = 400;
        message = err.message;
    } else if (err instanceof UnauthorizedError ) {
        statusCode = 401;
        message = err.message;
    } else if (err instanceof UserForbiddenError) {
        statusCode = 403;
        message = err.message;
    } else if (err instanceof NotFoundError) {
        statusCode = 404;
        message = err.message;
    } 

    if (statusCode >= 500) {
        console.log(err.message);
    }

    respondWithError(res, statusCode, message);
}
