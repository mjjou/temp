import { Request, Response } from 'express';
import { registerHandler } from '../../platform/dispatcher.js';
import MessageBroker, { MessageOperation, MessageType } from './MessageBroker.js';
import { MessageStorage } from './MessageStorage.js';
import { createService, ServiceIdentifier } from '../../platform/di/container.js';

export interface IChatService {
  routeRequest(req: Request, res: Response): Promise<void>;
}

export const IChatService: ServiceIdentifier<IChatService> =
  createService<IChatService>('chat-service');

export class ChatService implements IChatService {
  private broker: MessageBroker;
  private messageStorage: MessageStorage;

  private routeHandlers!: Map<string, (payload: any) => Promise<any> | void>;

  constructor(broker: MessageBroker, storage: MessageStorage) {
    this.broker = broker;
    this.messageStorage = storage;

    // register  dispatcher events
    this.registerHandlers();

    this.broker.subscribe(
      MessageType.PRIVATE,
      MessageOperation.CREATE,
      async (_op, message) => {
        await this.messageStorage.storeMessage(message);
        console.log('[ChatService] Stored private message');
      }
    );
  }

  private registerHandlers() {
    // a map
    this.routeHandlers = new Map([
      ['SEND_MESSAGE', this.handleSendMessage.bind(this)],
      ['RECALL_MESSAGE', this.handleRecallMessage.bind(this)],
      ['EDIT_MESSAGE', this.handleEditMessage.bind(this)],
      ['GET_PRIVATE_MESSAGES', this.handlePrivateMessages.bind(this)],
      ['GET_PUBLIC_MESSAGES', this.handlePublicMessages.bind(this)],
    ]);

    // register for dispatcher (sync)
    for (const [type, handler] of this.routeHandlers.entries()) {
      registerHandler(type, handler);
    }
  }

  public async routeRequest(req: Request, res: Response) {
    const { type, payload } = req.body;
    const handler = this.routeHandlers.get(type);

    if (!handler) {
      res.status(400).json({ success: false, error: `Unknown request type: ${type}` });
      return;
    }

    try {
      const result = await handler(payload);
      res.status(200).json({ success: true, ...(result ? { ...result } : {}) });
    } catch (err) {
      res.status(500).json({ success: false, error: String(err) });
    }
  }

  // === Actual Business Handlers ===
  private handleSendMessage(payload: any) {
    this.broker.publishCreate(payload);
  }

  private handleRecallMessage(payload: any) {
    this.broker.publishRecall(payload);
  }

  private handleEditMessage(payload: any) {
    this.broker.publishEdit(payload);
  }

  private async handlePrivateMessages(payload: any): Promise<{ count: number; data: any[] }> {
    const { userId, recipientId, limit = 50 } = payload || {};
    if (!userId || !recipientId) {
      throw new Error('userId and recipientId are required');
    }
    const messages = await this.messageStorage.getChatHistory(userId, recipientId, limit);
    return { count: messages.length, data: messages };
  }

  private async handlePublicMessages(payload: any): Promise<{ count: number; data: any[] }> {
    const { limit = 50 } = payload || {};
    const messages = await this.messageStorage.getMessages({ messageType: 'broadcast' }, limit);
    return { count: messages.length, data: messages };
  }
}
