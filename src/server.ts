import { Server } from "http";
import app from "./app";

let server: Server;

/**
 * Closes the Express server.
 * @param server Express server instance
 * @returns void
 */
function closeServer(): Promise<void> {
  return new Promise((resolve, reject) => {
    if (server) {
      server.close((error) => {
        if (error) {
          return reject(error);
        }
        resolve();
      });
    } else {
      resolve();
    }
  });
}

/**
 * Graceful shutdown of the server
 */
async function shutdown(): Promise<void> {
  try {
    await closeServer();
    console.log("Server has been shut down successfully.");
    process.exit(0);
  } catch (error) {
    console.error("Error during shutdown: ", error);
    process.exit(1);
  }
}

/**
 * Sets up and starts the Express server
 */
function startup(): void {
  try {
    const environment = app.get("env") as string;
    const port = app.get("port") as number;

    server = app.listen(port, () => {
      console.log(
        "startupLog",
        `-> Server is running on http://localhost:${port} in ${environment} mode\n` +
          `-> API documentation is available at http://localhost:${port}/api-docs/v1`,
      );
    });
    console.log(" Press CTRL-C to stop\n");
  } catch (error) {
    console.error("Error starting up the server", error);
    shutdown();
  }
}

void startup();

process.on("SIGTERM", shutdown);
process.on("SIGINT", shutdown);
