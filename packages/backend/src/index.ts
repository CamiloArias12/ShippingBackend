import "reflect-metadata";  // This import must be first!
import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import * as dotenv from 'dotenv';
import mysql from "mysql2/promise";
import { UserRepository } from "./repositories/UserRepository";
import { config } from "./config";
import { UserService } from "./services/UserService";
import { MailerService } from "./infrastructure/email/email";
import { JwtService } from "./utils/Jwt";
import { UserController } from "./api/v1/controllers/UserController";
import { UserRoutes } from "./api/v1/routes/UserRoutes";
import { AuthMiddleware } from "./api/middlewares/AuthMiddleware";
import { ShipmentRoutes } from "./api/v1/routes/ShipmentRoutes";
import { ShipmentController } from "./api/v1/controllers/ShipmentController";
import { ShipmentService } from "./services/ShipmentService";
import { ShipmentRepository } from "./repositories/ShipmentRepository";

(async () => {
  dotenv.config();

  try {
    const app = express();
    app.use(cors());
    app.use(bodyParser.json());
    app.use(bodyParser.urlencoded({ extended: true }));

    app.get("/ping", (_req, res) => {
      console.log("ping");
      res.send("pong");
    });
    const db = mysql.createPool({
      host: config.db.host || "localhost",
      port: config.db.port || 3306,
      database: config.db.name || "shipping_db",
      user: config.db.user || "shipping_user",
      password: config.db.password || "shipping_password",
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,
    });

    const middeware = new AuthMiddleware()
    const mailerService = new MailerService()
    const jwtService = new JwtService();
    const connection = await db.getConnection()
    const userRepository = new UserRepository(connection);
    const userService = new UserService(jwtService, userRepository, mailerService);
    const userController = new UserController(userService);
    new UserRoutes(app, middeware, userController);

    const shipmentRepository = new ShipmentRepository(connection);
    const shipmentService = new ShipmentService(shipmentRepository, mailerService);
    const shipmentController = new ShipmentController(shipmentService);
    new ShipmentRoutes(app, middeware, shipmentController);



    const port = process.env.PORT || 8000;
    app.listen(port, () => {
      console.log("Server Run Port : " + port);
    });
  } catch (error) {
    console.error("Error starting server:", error);
  }
})();
