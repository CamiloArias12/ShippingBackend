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
import { ShipmentController } from "./api/v1/controllers/ShipmentController";
import { ShipmentService } from "./services/ShipmentService";
import { ShipmentRepository } from "./repositories/ShipmentRepository";
import { ShipmentStatusHistoryRepository } from "./repositories/ShipmentStatusHistoryRepository";
import { RedisService } from './infrastructure/cache/redis';
import { ShipmentRoutes } from "./api/v1/routes/ShipmentRoutes";
import { Logger } from "./utils/Logger";
import { SocketIOService } from "./infrastructure/socketio/socketio";

async function main() {
  const logger = new Logger();
  try {
    dotenv.config();

    // Database
    const dbPool = mysql.createPool({
      host: config.db.host,
      port: config.db.port || 3306,
      database: config.db.name,
      user: config.db.user,
      password: config.db.password,
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,
    });
    const dbConnection = await dbPool.getConnection();
    logger.log('info', "DB connected");

    // Redis
    const redisService = new RedisService(
      config.redis.host,
     config.redis.port,
      config.redis.password,
      config.redis.db,
      config.redis.ttl
    );
    await redisService.connect();
    logger.log('info', "Redis connected");

    // Express app
    const app = express();
    app.use(cors());
    app.use(bodyParser.json());
    app.use(bodyParser.urlencoded({ extended: true }));

    // Socket
    const socketIOService = new SocketIOService(logger);
    const socketPort = config.socketPort;
    socketIOService.createServer(socketPort);
    logger.log('info', `Socket.IO server running on port: ${socketPort}`);

    // Health Check
    app.get("/ping", (_req, res) => {
      console.log("ping");
      res.send("pong");
    });

    // Auth Middleware
    const jwtService = new JwtService();
    const authMiddleware = new AuthMiddleware(jwtService, logger);

    // General Services
    const mailerService = new MailerService(logger);

    // User
    const userRepository = new UserRepository(dbConnection, logger);
    const userService = new UserService(jwtService, userRepository, mailerService, logger);
    const userController = new UserController(userService,logger);
    const userRoutes = new UserRoutes(app, authMiddleware, userController);
    userRoutes.initializeRoutes();

    // Shipment
    const shipmentRepository = new ShipmentRepository(dbConnection, logger);
    const shipmentStatusHistoryRepository = new ShipmentStatusHistoryRepository(dbConnection, logger);
    const shipmentService = new ShipmentService(
      shipmentRepository,
      mailerService,
      shipmentStatusHistoryRepository,
      logger
    );
    const shipmentController = new ShipmentController(shipmentService, logger);
    const shipmentRoutes = new ShipmentRoutes(app, authMiddleware, shipmentController);
    shipmentRoutes.initializeRoutes();

    const port = process.env.PORT || 8000;
    app.listen(port, () => {
      logger.log('info', "Server Run Port : " + port);
    });
  } catch (error) {
    logger.error("Error starting server:", error);
  }
}

main();

