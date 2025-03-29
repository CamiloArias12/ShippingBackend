import http from 'http';
import { Server as SocketIOServer, Socket } from 'socket.io';
import { Logger } from "../../utils/Logger";

export class SocketIOService {
    private logger: Logger;
    private io: SocketIOServer | null = null;
    private server: http.Server | null = null;

    constructor(logger: Logger) {
        this.logger = logger;
    }

    createServer(port: number): void {
        this.server = http.createServer();
        this.io = new SocketIOServer(this.server);

        this.server.listen(port, () => {
            this.logger.info(`Socket.IO server is running on port ${port}`);
        });

        this.io.on('connection', (socket: Socket) => {
            this.logger.info(`Client connected: ${socket.id}`);
            this.setupListeners(socket);
        });
    }

    private setupListeners(socket: Socket): void {
        socket.on('message', (data) => {
            this.logger.info(`Received message: ${data}`);
            this.emit('response', { message: 'Message received' });
        });

        socket.on('disconnect', () => {
            this.logger.info(`Client disconnected: ${socket.id}`);
        });
    }

    emit(event: string, data: any): void {
        if (this.io) {
            this.io.emit(event, data);
            this.logger.info(`Emitted event: ${event} with data: ${JSON.stringify(data)}`);
        } else {
            this.logger.error('Socket.IO server is not initialized.', data);
        }
    }
}