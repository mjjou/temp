import { injectable } from 'inversify';
import { createChatMongoConnection } from '../../platform/database/mongodb.factory.js';
import ChatWebSocketServer from './WebSocketServer.js';
import MessageStorage from './MessageStorage.js';
import MessageBroker from './MessageBroker.js';
import { ChatDispatcher } from './Dispatcher.js';

@injectable()
export default class ChatService {
  private client: any;
  private db: any;
  private messageBroker: MessageBroker;
  private messageStorage!: MessageStorage;
  private chatWebSocketServer!: ChatWebSocketServer;
  private dispatcher!: ChatDispatcher;

  constructor() {
    this.messageBroker = new MessageBroker();
    this.chatWebSocketServer = new ChatWebSocketServer(this.messageBroker);
  }

  async init(): Promise<void> {
    try {
      const connection = await createChatMongoConnection();
      this.client = connection.client;
      this.db = connection.db;
      console.log('ChatService: MongoDB connected');

      this.messageStorage = new MessageStorage(this.db, this.messageBroker);
      console.log('ChatService: MessageStorage initialized');

      this.dispatcher = new ChatDispatcher(this.messageBroker, this.messageStorage);
      console.log('ChatService: Dispatcher initialized');

      this.chatWebSocketServer.init(8081);
      console.log('ChatService: WebSocket Server started');

      this.messageBroker.init();
      console.log('ChatService: MessageBroker initialized');

      console.log('ChatService initialized successfully');
    } catch (error) {
      console.error('ChatService failed to initialize:', error);
    }
  }


  public async handleRequest(req: any, res: any): Promise<void> {
    await this.dispatcher.routeRequest(req, res);
  }
}
