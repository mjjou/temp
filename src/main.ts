import { container } from './platform/di/container.js';
import ChatService from './services/chat/chat.service.js';


const chatService = container.get(ChatService);

chatService.init();
