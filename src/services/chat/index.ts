import { registerService } from '../../platform/di/container.js';
import ChatService, { IChatService } from './chat.service.js';

export function registerChatServices() {
  registerService(IChatService, new ChatService());
}
