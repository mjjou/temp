import { injectable } from 'inversify';
import { createChatMongoConnection } from '../../platform/database/mongodb.factory.js';
import { container } from '../../platform/di/container.js';

@injectable()
export default class ChatService {
  private client: any;
  private db: any;

  async init(): Promise<void> {
    try {
      const connection = await createChatMongoConnection();
      this.client = connection.client;
      this.db = connection.db;

      container.bind<any>('ChatDatabase').toConstantValue(this.db);

      console.log('ChatService: MongoDB connection injected into container.');
    } catch (error) {
      console.error('ChatService failed to initialize:', error);
    }
  }
}