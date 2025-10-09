import "reflect-metadata";

import express from "express";
import cors from "cors";
import http from "http";
import https from "https";
import { Server } from "socket.io";
import { access, constants } from "fs/promises";
import { resolve } from "path";
import { readFileSync } from "fs";

import { clientRoutes, commonPort, serverListeningHost } from "@common/routes";
import { loggingMiddleware } from "./middleware/logging";
import { corsMiddleware } from "./middleware/cors";
import {
  errorHandlingMiddleware,
  notFoundMiddleware,
} from "./middleware/errors";
import { CharactersController } from "./controllers/characters";
import { DefaultController } from "./controllers/default";
import { logger, useControllerRoutes } from "./framework";
import { PollingController } from "./controllers/polling";
import { MapSerializationFixes } from "@common/fixes";

export const serverHostname = serverListeningHost;
export const serverPort = commonPort;
export const serverSecPort = commonPort + 1;
export const serverAllowedMethods = ["get", "post", "put", "delete"];
export const preloadFlag = "--preload";

logger.info("Server", "Startup begin.");

const app = express();

app.use(express.urlencoded({ extended: true }));
app.use(
  express.json({
    reviver: MapSerializationFixes.reviver,
  }),
);

// app.use(cors({ origin: "https://felled-stars.org", credentials: true }));
app.use(corsMiddleware);
app.use(loggingMiddleware);

try {
  const staticPath = resolve(__dirname, "public");
  await access(staticPath, constants.F_OK);
  clientRoutes.forEach((r) => app.use(r, express.static(staticPath)));
  logger.info("Server", `Client routes loaded: [ ${clientRoutes.join(", ")} ]`);
} catch {
  logger.warn(
    "Server",
    "No `public` folder was found. Running in pure API mode.",
  );
}

useControllerRoutes(DefaultController, app);
DefaultController.preloadPrincess();
useControllerRoutes(CharactersController, app);
useControllerRoutes(PollingController, app);

app.use(errorHandlingMiddleware);
app.use(notFoundMiddleware);

const server = http.createServer(app);
server.listen(serverPort, () => {
  logger.info(
    "Server",
    `Startup finished, listening on:\nhttp://localhost:${serverPort}`,
  );
});

const options = {
  key: readFileSync(resolve(__dirname, "cert", "key.pem")),
  cert: readFileSync(resolve(__dirname, "cert", "cert.pem")),
};
const secServer = https.createServer(options, app);
secServer.listen(serverSecPort, () => {
  logger.info(
    "Server",
    `Secure server is listening on:\nhttps://localhost:${serverSecPort}`,
  );
});

if (process.argv.includes(preloadFlag)) {
  logger.info(
    "Server",
    `${preloadFlag} was passed, starting to preload media...`,
  );
  await CharactersController.preloadAndPreprocessMedia();
}

const io = new Server(server);

io.on("connection", (socket) => {
  socket.on("pols-change", (json: string) => {
    socket.broadcast.emit("pols-update", json);
  });
});
