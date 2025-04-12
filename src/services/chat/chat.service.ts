import { createChatMongoConnection } from '../../platform/database/mongodb.factory.js';
import ChatWebSocketServer from './WebSocketServer.js';
import MessageStorage from './MessageStorage.js';
import MessageBroker from './MessageBroker.js';
import { ChatDispatcher } from './Dispatcher.js';

export interface IChatService {
  init(): Promise<void>;
  handleRequest(req: any, res: any): Promise<void>;
}

export const CHAT_SERVICE = Symbol('IChatService');

export class ChatService implements IChatService {
  private client: any;
  private db: any;
  private messageBroker: MessageBroker;
  private messageStorage!: MessageStorage;
  private chatWebSocketServer!: ChatWebSocketServer;
  private dispatcher!: ChatDispatcher;

  constructor(messageBroker: MessageBroker, messageStorage: MessageStorage, webSocketServer: ChatWebSocketServer, dispatcher: ChatDispatcher) {
    this.messageBroker = messageBroker;
    this.messageStorage = messageStorage;
    this.dispatcher = dispatcher;
    this.chatWebSocketServer = webSocketServer
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
