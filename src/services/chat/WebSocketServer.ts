import { injectable, inject } from 'inversify';
import { Server } from 'socket.io';
import { createServer } from 'http';
import { v4 as uuidv4 } from 'uuid';
import MessageStorage from './MessageStorage.js';

interface ServerMessage {
    senderId: string;
    recipientId?: string;
    content: string;
    messageType: 'broadcast' | 'private';
    created_at: Date;
    isRead?: boolean;
    [key: string]: any;
}

@injectable()
export default class ChatWebSocketServer {
    private io!: Server;
    private httpServer: any;
    private connections: Map<string, string> = new Map();
    private messageHandler!: (clientId: string, message: string) => void;

    constructor(@inject('MessageStorage') private messageStorage: MessageStorage) { }

    public init(port: number, messageHandler: (clientId: string, message: string) => void): void {
        this.messageHandler = messageHandler;

        // Create HTTP server
        this.httpServer = createServer();

        // Create Socket.IO server
        this.io = new Server(this.httpServer, {
            cors: {
                origin: "*",
                methods: ["GET", "POST"]
            }
        });

        // Listen for connections
        this.io.on('connection', (socket) => {
            const clientId = socket.handshake.auth.userId || uuidv4();
            this.handleConnection(clientId, socket.id);

            socket.on('NEW_MESSAGE', async (messageData) => {
                try {

                    // Store in database
                    const messageId = await this.messageStorage.storeMessage(messageData);

                    // Emit to appropriate recipients
                    if (messageData.messageType === 'private' && messageData.recipientId) {
                        // For private messages, send to specific recipient
                        this.sendToUser(messageData.recipientId, {
                            ...messageData
                        });

                    } else {
                        this.broadcastMessage({
                            ...messageData
                        });
                    }
                } catch (error) {
                    console.error('Error processing message:', error);
                    socket.emit('error', { message: 'Failed to send message' });
                }
            });


            // Handle disconnection
            socket.on('disconnect', () => {
                this.handleDisconnection(clientId);
            });
        });

        // Start server
        this.httpServer.listen(port);
        console.log(`Socket.IO server started on port ${port}`);
    }

    private handleConnection(clientId: string, socketId: string): void {
        this.connections.set(clientId, socketId);
        console.log(`New client connected: ${clientId}`);

    }

    public sendToUser(userId: string, data: ServerMessage): void {
        const socketId = this.connections.get(userId);

        if (socketId) {
            this.io.to(socketId).emit('NEW_MESSAGE', data);
        } else {
            console.warn(`Cannot send to user ${userId}, not connected`);
        }
    }

    public broadcastMessage(data: ServerMessage, excludeUserId?: string): void {
        if (excludeUserId) {
            this.connections.forEach((socketId, userId) => {
                if (userId !== excludeUserId) {
                    this.io.to(socketId).emit('NEW_MESSAGE', data);
                }
            });
        } else {
            // Broadcast to all
            this.io.emit('NEW_MESSAGE', data);
        }
    }

    private handleDisconnection(clientId: string): void {
        this.connections.delete(clientId);
        console.log(`Client disconnected: ${clientId}`);
    }

    public sendToClient(clientId: string, data: ServerMessage): void {
        const socketId = this.connections.get(clientId);

        if (socketId) {
            this.io.to(socketId).emit('message', data);
        } else {
            console.warn(`Cannot send to client ${clientId}, connection not found`);
        }
    }

    public broadcastToAll(data: ServerMessage): void {
        this.io.emit('message', data);
    }

    public getConnections(): Map<string, string> {
        return this.connections;
    }
}