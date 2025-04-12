import { createChatMongoConnection } from '../../platform/database/mongodb.factory.js';
import { container, createInstance, createService, ServiceIdentifier } from '../../platform/di/container.js';
import ChatWebSocketServer from './WebSocketServer.js';
import MessageStorage from './MessageStorage.js';

// TODO: revise later
const ChatDatabaseKey = Symbol('ChatDatabase');
const MessageStorageKey = Symbol('MessageStorage');

export const IChatService: ServiceIdentifier<IChatService> = createService<IChatService>('chat-service');

export interface IChatService {
  init(): Promise<void>;
}

export default class ChatService implements IChatService {
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

      container.set(ChatDatabaseKey, this.db);
      this.messageStorage = new MessageStorage(this.db);
      container.set(MessageStorageKey, this.messageStorage);

      this.chatWebSocketServer = createInstance(ChatWebSocketServer);

      this.chatWebSocketServer.init(8080, (clientId, message) => {
        const parsedMessage = JSON.parse(message);
        console.log(`Received message from client ${clientId}:`, parsedMessage);

      });
      await this.testCreateMessage();


      console.log('ChatService: MongoDB connection injected into container.');
    } catch (error) {
      console.error('ChatService failed to initialize:', error);
    }
  }


  private async testCreateMessage(): Promise<void> {
    try {
      console.log('Testing message creation...');

      // Create a test message
      const testMessage = {
        senderId: "testUser1",
        recipientId: "testUser2",
        content: "This is a test message",
        messageType: 'private' as 'broadcast' | 'private',
        created_at: new Date(),
        isRead: false
      };

      // Store the message
      const messageId = await this.messageStorage.storeMessage(testMessage);

      console.log(`Test message created with ID: ${messageId}`);
      console.log('Message details:', testMessage);

      // Retrieve the message to verify
      const messages = await this.messageStorage.getMessages({
        senderId: "testUser1"
      } as any, 1);

      if (messages.length > 0) {
        console.log('Successfully retrieved the test message from database:');
        console.log(messages[0]);
      } else {
        console.log('Failed to retrieve the test message.');
      }

    } catch (error) {
      console.error('Error in test message creation:', error);
    }
  }
}
