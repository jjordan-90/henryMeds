import express from "express";
import routes from "./routes/v1/appointments.route";
import swaggerUi from "swagger-ui-express";
import swaggerJsdoc from "swagger-jsdoc";
import swaggerOptions from "./swagger/swaggerOptions";
import { getPort, getBodySizeLimit } from "./config/environment";
import { authMiddleware } from "./middleware/authentication";
import compression from "compression";
import lusca from "lusca";
import bodyParser from "body-parser";
import { errorHandler } from "./middleware/errorHandler";

/**
 * OpenAPI Swagger
 */
const apiSpec = swaggerJsdoc(swaggerOptions);

const app = express();

/**
 * App Configuration
 */
app.set("port", getPort());
app.use(compression());
app.use(
  bodyParser.json({
    limit: getBodySizeLimit(),
    type: ["application/json"],
  }),
);
app.use(bodyParser.urlencoded({ limit: getBodySizeLimit(), extended: true }));
app.use(lusca.xframe("SAMEORIGIN"));
app.use(lusca.xssProtection(true));

/**
 * Authentication Middleware
 */
app.use(authMiddleware);

/**
 * Routes
 */
app.use("/api/v1", routes);
app.use("/api-docs/v1", swaggerUi.serve, swaggerUi.setup(apiSpec));

/**
 * Error Handler
 */
app.use(errorHandler);

export default app;
