import type { MigrationConfig } from "drizzle-orm/migrator";

type Config = {
    api: APIConfig;
    db: DBConfig;
};

export type APIConfig = {
    fileserverHits: number;
    port: number;
    platform: string;
};

export type DBConfig = {
    url: string,
    migrationConfig: MigrationConfig,
};

process.loadEnvFile();

function envOrThrow(key: string) {
    const value = process.env[key];
    if ( ! value ) {
        throw new Error(`Environment variable ${key} is not set`);
    } else {
        return value;
    }
}

export const migrationConfig: MigrationConfig = {
  migrationsFolder: "./src/db/migrations",
};

export const config: Config = {
    api: {
        fileserverHits: 0,
        port: Number(envOrThrow("PORT")),
        platform: envOrThrow("PLATFORM"),
    },
    db: {
        url: envOrThrow("DB_URL"),
        migrationConfig: migrationConfig,
    },
}





