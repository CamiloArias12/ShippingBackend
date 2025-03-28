import "reflect-metadata";  // This import must be first!
import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import dotenv from "dotenv";
import mysql from "mysql2/promise";
import { UserRepository } from "./repositories/UserRepository";
import { config } from "./config";
import { UserService } from "./services/UserService";
import { MailerService } from "./infratructure/email/email";
import { JwtService } from "./utils/Jwt";
import { UserController } from "./api/v1/controllers/UserController";
import { UserRoutes } from "./api/v1/routes/user.routes";
import { AuthMiddleware } from "./api/middlewares/authMiddleware";

(async () => {
  dotenv.config();

  try {
    const app = express();
    app.use(cors());
    app.use(bodyParser.json());
    app.use(bodyParser.urlencoded({ extended: true }));


    const db = mysql.createPool({
      host: config.db.host || "localhost",
      port: config.db.port || 3306,
      database: config.db.name || "task_manager",
      user: config.db.user || "task_user",
      password: config.db.password || "taskPass456",
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

  } catch (error) {
  }
})();
