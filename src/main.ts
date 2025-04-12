import express from 'express';
import { registerGatewayServices } from './services/gateway/index.js';
import { getService } from './platform/di/container.js';
import { IGatewayService } from './services/gateway/gateway.service.js';
import cors from 'cors';
import { CHAT_SERVICE, IChatService } from './services/chat/chat.service.js';
import { registerChatServices } from './services/chat/index.js';

async function bootstrap() {
  await registerChatServices();
  const chatService = getService<IChatService>(CHAT_SERVICE);
  const app = express();
  app.use(cors());
  app.use(express.json());
  app.all('/api/messages/*', (req, res) => chatService.handleRequest(req, res));

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
