import express from 'express';
import { createChatMongoConnection } from './platform/database/mongodb.factory.js';
import { registerGatewayServices } from './services/gateway/index.js';
import { getService } from './platform/di/container.js';
import { IGatewayService } from './services/gateway/gateway.service.js';

import MessageBroker from './services/chat/MessageBroker.js';
import { MessageStorage } from './services/chat/MessageStorage.js';
import { ChatService } from './services/chat/chat.service.js';

async function bootstrap() {
  const { db } = await createChatMongoConnection();
  const broker = new MessageBroker();
  const storage = new MessageStorage(db);
  const chatService = new ChatService(broker, storage);

  const app = express();
  app.use(express.json());
  app.post('/api/chat', (req, res) => chatService.routeRequest(req, res));

  app.listen(4000, () => {
    console.log('[ChatService] direct route listening on http://localhost:4000');
  });

  // gateway DI setup
  registerGatewayServices();
  const gateway = getService(IGatewayService);
  gateway.init();

  console.log('[main] system bootstrap complete.');
}

bootstrap().catch((err) => {
  console.error('[main] bootstrap failed:', err);
  process.exit(1);
});
