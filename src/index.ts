import express from "express";
import postgres from "postgres";
import { migrate } from "drizzle-orm/postgres-js/migrator";
import { drizzle } from "drizzle-orm/postgres-js";
import { handlerReadiness } from "./api/readiness.js"
import { handlerMetrics } from "./api/metrics.js";
import {  handlerReset } from "./api/reset.js";
import { handlerChirp, handlerRetrieveAllChirps, handlerRetrieveChirp } from "./api/chirp.js"
import { handlerUsersCreate, handlerUsersUpdate } from "./api/users.js";
import { middlewareLogResponses, middlewareMetricsInc, errorMiddleware } from "./api/middleware.js";
import "./config.js"
import { config } from "./config.js"
import { handlerLogin } from "./api/login.js";
import { handlerRefresh, handlerRevoke } from "./api/refresh.js";


const migrationClient = postgres(config.db.url, { max: 1 });
await migrate(drizzle(migrationClient), config.db.migrationConfig);

const app = express();

app.use(middlewareLogResponses);
app.use(express.json());

app.use("/app", middlewareMetricsInc, express.static("./src/app"));

app.post("/api/healthz", (req, res, next) => {
    Promise.resolve(handlerReadiness(req, res)).catch(next);
});
app.get("/admin/metrics", (req, res, next) => {
    Promise.resolve(handlerMetrics(req, res)).catch(next);
});
app.post("/admin/reset", (req, res, next) => {
    Promise.resolve(handlerReset(req, res)).catch(next);
});
app.post("/api/users", (req, res, next) => {
    Promise.resolve(handlerUsersCreate(req, res)).catch(next);
});
app.put("/api/users", (req, res, next) => {
    Promise.resolve(handlerUsersUpdate(req, res)).catch(next);
})
app.post("/api/chirps", (req, res, next) => {
    Promise.resolve(handlerChirp(req, res)).catch(next);
});
app.get("/api/chirps", (req, res, next) => {
    Promise.resolve(handlerRetrieveAllChirps(req, res)).catch(next);
});
app.get("/api/chirps/:chirpId", (req, res, next) => {
    Promise.resolve(handlerRetrieveChirp(req, res)).catch(next);
});
app.post("/api/login", (req, res, next) => {
    Promise.resolve(handlerLogin(req, res)).catch(next);
});
app.post("/api/refresh", (req, res, next) => {
    Promise.resolve(handlerRefresh(req, res)).catch(next);
});
app.post("/api/revoke", (req, res, next) => {
    Promise.resolve(handlerRevoke(req, res)).catch(next);
})


app.use(errorMiddleware);
app.listen(config.api.port, () => {
    console.log(`Server is running at http://localhost:${config.api.port}`);
});
