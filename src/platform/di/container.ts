import { Container } from 'inversify';
import ChatService from '../../services/chat/chat.service.js';
// import { GatewayService } from '../../services/gateway/gateway.service.js';
// initialize the DI container
const container = new Container();
container.bind(ChatService).toSelf()

export { container };
