import { injectable } from 'inversify';
import { createChatMongoConnection } from '../../platform/database/mongodb.factory.js';
import { container } from '../../platform/di/container.js';
import ChatWebSocketServer from './WebSocketServer.js';
import MessageStorage from './MessageStorage.js';
import { Request, Response } from 'express';

@injectable()
export default class ChatService {
  private client: any;
  private db: any;
  private chatWebSocketServer!: ChatWebSocketServer;
  private messageStorage!: MessageStorage;

  constructor() {
  }

  async init(): Promise<void> {
    try {
      const connection = await createChatMongoConnection();
      this.client = connection.client;
      this.db = connection.db;

      container.bind<any>('ChatDatabase').toConstantValue(this.db);
      this.messageStorage = new MessageStorage(this.db);
      container.bind<MessageStorage>('MessageStorage').toConstantValue(this.messageStorage);

      this.chatWebSocketServer = container.resolve(ChatWebSocketServer);

      this.chatWebSocketServer.init(8080, (clientId, message) => {
        const parsedMessage = JSON.parse(message);
        console.log(`Received message from client ${clientId}:`, parsedMessage);

      });
      // await this.testCreateMessage();
      // await this.addPublicMessages();


      console.log('ChatService: MongoDB connection injected into container.');
    } catch (error) {
      console.error('ChatService failed to initialize:', error);
    }
  }

  async handlePrivateMessagesRequest(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.query.userId as string;
      const recipientId = req.query.recipientId as string;
      const limit = parseInt(req.query.limit as string) || 50;

      if (!userId || !recipientId) {
        res.status(400).json({
          success: false,
          error: 'userId and recipientId parameters are required'
        });
        return;
      }

      const messages = await this.messageStorage.getChatHistory(userId, recipientId, limit);

      res.status(200).json({
        success: true,
        count: messages.length,
        data: messages
      });
    } catch (error) {
      console.error('Failed to retrieve private messages:', error);
      res.status(500).json({
        success: false,
        error: 'Error occurred while retrieving private messages'
      });
    }
  }

  async handlePublicMessagesRequest(req: Request, res: Response): Promise<void> {
    try {
      const limit = parseInt(req.query.limit as string) || 50;

      const query = {
        messageType: 'broadcast'
      };

      const messages = await this.messageStorage.getMessages(query, limit);

      res.status(200).json({
        success: true,
        count: messages.length,
        data: messages
      });
    } catch (error) {
      console.error('Failed to retrieve group messages:', error);
      res.status(500).json({
        success: false,
        error: 'Error occurred while retrieving group messages'
      });
    }
  }



}

