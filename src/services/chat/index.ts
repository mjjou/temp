import { registerService } from '../../platform/di/container.js';
import { IChatService, ChatService } from './chat.service.js';
import MessageBroker from './MessageBroker.js';
import { MessageStorage } from './MessageStorage.js';
import { createChatMongoConnection } from '../../platform/database/mongodb.factory.js';

export async function registerChatServices() {
  const { db } = await createChatMongoConnection();
  const broker = new MessageBroker();
  const storage = new MessageStorage(db);
  const service = new ChatService(broker, storage);

  registerService(IChatService, service);
}
