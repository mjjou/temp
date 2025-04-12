import { registerService } from '../../platform/di/container.js';
import { CHAT_SERVICE, ChatService } from './chat.service.js';
import MessageBroker from './MessageBroker.js';
import MessageStorage from './MessageStorage.js';
import { createChatMongoConnection } from '../../platform/database/mongodb.factory.js';
import ChatWebSocketServer from './WebSocketServer.js';
import { ChatDispatcher } from './Dispatcher.js';

export async function registerChatServices() {
  const { db } = await createChatMongoConnection();
  const broker = new MessageBroker();
  const storage = new MessageStorage(db, broker);
  const webSocketServer = new ChatWebSocketServer(broker);
  const dispatcher = new ChatDispatcher(broker, storage);
  const service = new ChatService(broker, storage, webSocketServer, dispatcher);

  registerService(CHAT_SERVICE, service);
}
