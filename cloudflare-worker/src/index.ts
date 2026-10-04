import { createHotUpdater } from "@hot-updater/server/runtime";
import { Hono } from "hono";
import {
  d1Database,
  r2Storage,
  verifyJwtSignedUrl,
} from "@hot-updater/cloudflare/worker";

export type CloudflareWorkerEnv = {
  DB: D1Database;
  BUCKET: R2Bucket;
  JWT_SECRET: string;
};

export const HOT_UPDATER_BASE_PATH = "/api/check-update";

const resolveRequestOrigin = (context?: { request?: Request }) => {
  const request = context?.request;
  if (!request) {
    throw new Error("r2WorkerStorage requires a request to resolve publicBaseUrl.");
  }
  return new URL(request.url).origin;
};

const hotUpdater = createHotUpdater({
  database: d1Database(),
  storages: [
    r2Storage({
      publicBaseUrl: resolveRequestOrigin,
    }),
  ],
  basePath: HOT_UPDATER_BASE_PATH,
  routes: {
    updateCheck: true,
    bundles: false,
  },
});

const app = new Hono<{ Bindings: CloudflareWorkerEnv }>();

// Standard Hot Updater base route
app.mount(
  HOT_UPDATER_BASE_PATH,
  (request: Request, env: CloudflareWorkerEnv) => {
    return hotUpdater.handler(request, {
      request,
      env,
    });
  },
  {
    optionHandler: (c) => [c.env],
  },
);

// Fallback compatibility routes for requests without /api/check-update prefix
app.all("/app-version/*", (c) => {
  const url = new URL(c.req.url);
  url.pathname = `${HOT_UPDATER_BASE_PATH}${url.pathname}`;
  return hotUpdater.handler(new Request(url.toString(), c.req.raw), {
    request: c.req.raw,
    env: c.env,
  });
});

app.all("/fingerprint/*", (c) => {
  const url = new URL(c.req.url);
  url.pathname = `${HOT_UPDATER_BASE_PATH}${url.pathname}`;
  return hotUpdater.handler(new Request(url.toString(), c.req.raw), {
    request: c.req.raw,
    env: c.env,
  });
});

// Serve bundle archives and assets from R2 with JWT verification
app.get("*", async (c) => {
  const result = await verifyJwtSignedUrl({
    path: c.req.path,
    token: c.req.query("token"),
    jwtSecret: c.env.JWT_SECRET,
    handler: async (storageUri) => {
      const [, ...key] = storageUri.split("/");
      const object = await c.env.BUCKET.get(key.join("/"));
      if (!object) {
        return null;
      }

      return {
        body: object.body,
        contentType: object.httpMetadata?.contentType,
      };
    },
  });

  if (result.status !== 200) {
    return c.json({ error: result.error }, result.status as 400 | 403 | 404);
  }

  return c.body(result.responseBody, 200, result.responseHeaders);
});

export default app;
