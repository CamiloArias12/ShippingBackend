import { Server } from "socket.io";
import { Logger } from "../../utils/Logger";

export class SocketIOService {
    private io: Server;
    private logger: Logger;

    constructor(logger: Logger) {
        this.logger = logger;
    }

    createServer(port: number): void {
        this.io = new Server(port, {
            cors: {
                origin: "*", // Permitir todas las solicitudes de origen cruzado
                methods: ["GET", "POST"], // Métodos permitidos
            },
        });

        this.io.on("connection", (socket) => {
            this.logger.log("info", `New client connected: ${socket.id}`);

            socket.on("disconnect", () => {
                this.logger.log("info", `Client disconnected: ${socket.id}`);
            });
        });
    }

    emit(event: string, data: any): void {
        this.io.emit(event, data);
    }


}