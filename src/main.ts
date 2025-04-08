import { container } from '../src/platform/di/container.js';
import ChatService from '../src/services/chat/chat.service.js';


const chatService = container.get(ChatService);

chatService.init();
