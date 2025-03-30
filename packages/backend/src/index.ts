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
import { DriverService } from './services/DriverService';
import { RouteService } from './services/RouteService';
import { DriverRepository } from './repositories/DriverRepository';
import { RouteRepository } from './repositories/RouteRepository';

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

    // Initialize repositories
    const userRepository = new UserRepository(dbPool, logger);
    const driverRepository = new DriverRepository(dbPool, logger);
    const routeRepository = new RouteRepository(dbPool, logger);
    const shipmentRepository = new ShipmentRepository(dbPool, logger);
    const shipmentStatusHistoryRepository = new ShipmentStatusHistoryRepository(dbPool, logger);

    // Initialize services
    const userService = new UserService(jwtService, userRepository, mailerService, logger);
    const driverService = new DriverService(driverRepository, userService, logger);
    const routeService = new RouteService(routeRepository, logger);
    const shipmentService = new ShipmentService(
      shipmentRepository,
      mailerService,
      shipmentStatusHistoryRepository,
      logger,
      userService,
      driverService,
      routeService
    );

    // User
    const userController = new UserController(userService, logger);
    const userRoutes = new UserRoutes(app, authMiddleware, userController);
    userRoutes.initializeRoutes();

    // Shipment
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

