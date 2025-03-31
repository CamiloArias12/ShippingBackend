import "reflect-metadata";  // This import must be first!
import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import * as dotenv from 'dotenv';
import mysql from "mysql2/promise";
import { UserRepository } from "./repositories/UserRepository";
import { config } from "./config";
import { UserService } from "./services/UserService";
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
import { RouteController } from "./api/v1/controllers/RouteController";
import { RouteRoutes } from "./api/v1/routes/RouteRoutes";
import { DriverController } from "./api/v1/controllers/DriverController";
import { DriverRoutes } from "./api/v1/routes/DriveRoutes";
import swaggerUi from 'swagger-ui-express';
import swaggerJsdoc from 'swagger-jsdoc';
import { MailerService } from "./infrastructure/email/email";

async function main() {
  try {
    dotenv.config();
    const logger = new Logger();

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

    // Swagger
    const swaggerOptions = {
      swaggerDefinition: {
        openapi: '3.0.0',
        info: {
          title: 'Shipping API',
          version: '1.0.0',
          description: 'API documentation for the Shipping application',
        },
      },
      apis: ['./src/api/v1/routes/*.ts', './src/domain/entities/*.ts', '../shared/src/**/*.ts'], // Path to the API docs
    };
    const swaggerDocs = swaggerJsdoc(swaggerOptions);
    app.use('/api/v1/docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));
    logger.log('info', "Swagger docs available at /api/v1/docs");

    // Socket
    const socketIOService = new SocketIOService(logger);
    const socketPort = config.socketPort;
    socketIOService.createServer(socketPort);
    logger.log('info', `Socket.IO server running on port: ${socketPort}`);


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
      routeService,
      socketIOService,
      redisService
    );

    // User
    const userController = new UserController(userService, logger);
    const userRoutes = new UserRoutes(app, authMiddleware, userController);
    userRoutes.initializeRoutes();

    // Shipment
    const shipmentController = new ShipmentController(shipmentService, logger);
    const shipmentRoutes = new ShipmentRoutes(app, authMiddleware, shipmentController);
    shipmentRoutes.initializeRoutes();

    //Route
    const routeController = new RouteController(routeService, logger);
    const routeRoutes = new RouteRoutes(app, authMiddleware, routeController);
    routeRoutes.initializeRoutes();
    //Driver
    const driverController = new DriverController(driverService, logger);
    const driverRoutes = new DriverRoutes(app, authMiddleware, driverController);
    driverRoutes.initializeRoutes();

    const port = process.env.PORT || 8000;
    app.listen(port, () => {
      logger.log('info', "Server Run Port : " + port);
    });
  } catch (error) {
    console.error("Error starting the server:", error);
  }
}

main();

