import { Options } from "swagger-jsdoc";

const options: Options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "HenryMeds Appointment API",
      version: "1.0.0",
      description: "API for managing appointments",
    },
    servers: [
      {
        url: "http://localhost:5000/api/v1",
      },
    ],
  },
  apis: ["./src/routes/v1/*.ts"],
};

export default options;
