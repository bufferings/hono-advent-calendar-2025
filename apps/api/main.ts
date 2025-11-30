import { OpenAPIHono } from "@hono/zod-openapi";
import { cors } from "hono/cors";
import { swaggerUI } from "@hono/swagger-ui";
import { closeDb } from "./db/client.ts";
import {
  createOrderRoute,
  createOrderHandler,
} from "./handlers/createOrder.ts";
import { getOrdersRoute, getOrdersHandler } from "./handlers/getOrders.ts";
import {
  startCookingRoute,
  startCookingHandler,
} from "./handlers/startCooking.ts";
import {
  deliverOrderRoute,
  deliverOrderHandler,
} from "./handlers/deliverOrder.ts";

const app = new OpenAPIHono();

app.use(
  "/*",
  cors({
    origin: ["http://localhost:5173", "http://127.0.0.1:5173"],
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowHeaders: ["Content-Type"],
  })
);

// API routes
const api = new OpenAPIHono();
api.openapi(createOrderRoute, createOrderHandler);
api.openapi(getOrdersRoute, getOrdersHandler);
api.openapi(startCookingRoute, startCookingHandler);
api.openapi(deliverOrderRoute, deliverOrderHandler);

app.route("/api", api);

// OpenAPI ドキュメント
app.doc("/doc", {
  openapi: "3.0.0",
  info: {
    title: "回転寿司オーダー API",
    version: "1.0.0",
  },
});

// Swagger UI
app.get("/ui", swaggerUI({ url: "/doc" }));

const server = Deno.serve({ port: 3000 }, app.fetch);

// シャットダウン時にコネクションプールを解放
async function shutdown() {
  console.log("Shutting down...");
  await closeDb();
  await server.shutdown();
  Deno.exit(0);
}

Deno.addSignalListener("SIGINT", shutdown);
Deno.addSignalListener("SIGTERM", shutdown);
