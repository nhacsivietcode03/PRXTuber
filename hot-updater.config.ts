import { defineConfig } from "hot-updater";
import { expo } from "@hot-updater/expo";
import { r2Storage, d1Database } from "@hot-updater/cloudflare";
import { config } from "dotenv";

config({ path: ".env.hotupdater" });

export default defineConfig({
  build: expo(),
  storage: r2Storage({
    bucketName: process.env.HOT_UPDATER_R2_BUCKET!,
    accountId: process.env.CLOUDFLARE_ACCOUNT_ID!,
    accessKeyId: process.env.CLOUDFLARE_R2_ACCESS_KEY_ID!,
    secretAccessKey: process.env.CLOUDFLARE_R2_SECRET_ACCESS_KEY!,
  }),
  database: d1Database({
    databaseId: process.env.CLOUDFLARE_D1_DATABASE_ID!,
    accountId: process.env.CLOUDFLARE_ACCOUNT_ID!,
    apiToken: process.env.CLOUDFLARE_API_TOKEN!,
  }),
  signing: {
    enabled: true,
    privateKeyPath: "./keys/private-key.pem",
  },
});
