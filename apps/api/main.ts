import { Hono } from "@hono/hono";
import { cors } from "@hono/hono/cors";
import { createOrder } from "./handlers/createOrder.ts";
import { getOrders } from "./handlers/getOrders.ts";
import { startCooking } from "./handlers/startCooking.ts";
import { deliverOrder } from "./handlers/deliverOrder.ts";

const app = new Hono();

app.use(
  "/*",
  cors({
    origin: ["http://localhost:5173", "http://127.0.0.1:5173"],
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowHeaders: ["Content-Type"],
  })
);

const api = new Hono();
api.route("/", createOrder);
api.route("/", getOrders);
api.route("/", startCooking);
api.route("/", deliverOrder);

app.route("/api", api);

Deno.serve({ port: 3000 }, app.fetch);

