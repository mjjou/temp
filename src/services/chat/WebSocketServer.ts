import { Server } from 'socket.io';
import { createServer } from 'http';
import { v4 as uuidv4 } from 'uuid';
import MessageBroker, {
  MessageType,
  MessageOperation,
  MessageHandler
} from './MessageBroker.js';
import { ChatMessage } from './MessageStorage.js';

export default class ChatWebSocketServer {
  private io!: Server;
  private httpServer: any;
  private connections: Map<string, string> = new Map();
  private brokerSubscriptions: string[] = [];

  constructor(private messageBroker: MessageBroker) {
    // If needed, you can do `this.messageBroker = messageBroker || new MessageBroker();`
  }

  public init(port: number): void {
    // Create HTTP server
    this.httpServer = createServer();

    // Create Socket.IO server
    this.io = new Server(this.httpServer, {
      cors: {
        origin: '*',
        methods: ['GET', 'POST']
      }
    });

    // Listen for WebSocket connections
    this.io.on('connection', (socket) => {
      const clientId = socket.handshake.auth.userId || uuidv4();
      this.handleConnection(clientId, socket.id);

      // Handle disconnection
      socket.on('disconnect', () => {
        this.handleDisconnection(clientId);
      });
    });

    // Setup broker subscriptions
    this.setupBrokerSubscriptions();

    // Start HTTP server
    this.httpServer.listen(port);
    console.log(`Socket.IO server started on port ${port}`);
  }

  private setupBrokerSubscriptions(): void {
    // Public CREATE
    const publicCreateSub = this.messageBroker.subscribe(
      MessageType.PUBLIC,
      MessageOperation.CREATE,
      this.handlePublicMessageCreation.bind(this)
    );
    this.brokerSubscriptions.push(publicCreateSub);

    // Private CREATE
    const privateCreateSub = this.messageBroker.subscribe(
      MessageType.PRIVATE,
      MessageOperation.CREATE,
      this.handlePrivateMessageCreation.bind(this)
    );
    this.brokerSubscriptions.push(privateCreateSub);

    // Public RECALL
    const publicRecallSub = this.messageBroker.subscribe(
      MessageType.PUBLIC,
      MessageOperation.RECALL,
      this.handlePublicMessageRecall.bind(this)
    );
    this.brokerSubscriptions.push(publicRecallSub);

    // Private RECALL
    const privateRecallSub = this.messageBroker.subscribe(
      MessageType.PRIVATE,
      MessageOperation.RECALL,
      this.handlePrivateMessageRecall.bind(this)
    );
    this.brokerSubscriptions.push(privateRecallSub);

    // Public EDIT
    const publicEditSub = this.messageBroker.subscribe(
      MessageType.PUBLIC,
      MessageOperation.EDIT,
      this.handlePublicMessageEdit.bind(this)
    );
    this.brokerSubscriptions.push(publicEditSub);

    // Private EDIT
    const privateEditSub = this.messageBroker.subscribe(
      MessageType.PRIVATE,
      MessageOperation.EDIT,
      this.handlePrivateMessageEdit.bind(this)
    );
    this.brokerSubscriptions.push(privateEditSub);
  }

  private handlePublicMessageCreation(_op: MessageOperation, message: ChatMessage): void {
    // Broadcast public message to all connected clients
    this.broadcastMessage(message);
  }

  private handlePrivateMessageCreation(_op: MessageOperation, message: ChatMessage): void {
    // Send private message to specific recipient
    if (message.recipientId) {
      this.sendToUser(message.recipientId, message);
    }
  }

  private handlePublicMessageRecall(_op: MessageOperation, message: ChatMessage): void {
    // Broadcast message recall
    this.broadcastMessage({
      ...message,
      isRecalled: true,
      content: 'Message has been recalled'
    });
  }

  private handlePrivateMessageRecall(_op: MessageOperation, message: ChatMessage): void {
    // Send message recall to specific recipient
    if (message.recipientId) {
      this.sendToUser(message.recipientId, {
        ...message,
        isRecalled: true,
        content: 'Message has been recalled'
      });
    }
  }

  private handlePublicMessageEdit(_op: MessageOperation, message: ChatMessage): void {
    // Broadcast edited public message
    this.broadcastMessage(message);
  }

  private handlePrivateMessageEdit(_op: MessageOperation, message: ChatMessage): void {
    // Send edited private message to specific recipient
    if (message.recipientId) {
      this.sendToUser(message.recipientId, message);
    }
  }

  private handleConnection(clientId: string, socketId: string): void {
    this.connections.set(clientId, socketId);
    console.log(`New client connected: ${clientId}`);
  }

  private handleDisconnection(clientId: string): void {
    this.connections.delete(clientId);
    console.log(`Client disconnected: ${clientId}`);
  }

  private sendToUser(userId: string, data: ChatMessage): void {
    const socketId = this.connections.get(userId);
    if (socketId) {
      this.io.to(socketId).emit('NEW_MESSAGE', data);
    } else {
      console.warn(`Cannot send to user ${userId}, not connected`);
    }
  }

  private broadcastMessage(data: ChatMessage, excludeUserId?: string): void {
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

  public getConnections(): Map<string, string> {
    return this.connections;
  }

  // Cleanup method to unsubscribe from broker
  public shutdown(): void {
    // Unsubscribe from all broker subscriptions
    this.brokerSubscriptions.forEach((subId) => {
      this.messageBroker.unsubscribe(subId);
    });

    // Close HTTP server
    this.httpServer.close();
  }
}
