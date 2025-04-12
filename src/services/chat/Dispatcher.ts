import { injectable, inject } from 'inversify';
import { Request, Response } from 'express';
import MessageBroker from './MessageBroker.js';
import MessageStorage from './MessageStorage.js';
@injectable()
export class ChatDispatcher {
    constructor(
        private broker: MessageBroker,
        private messageStorage: MessageStorage
    ) { }

    public async routeRequest(req: Request, res: Response): Promise<void> {

        if (req.method === 'GET') {
            if (req.path === '/api/messages/private') {
                await this.handlePrivateMessagesRequest(req, res);
                return;
            } else if (req.path === '/api/messages/public') {
                await this.handlePublicMessagesRequest(req, res);
                return;
            }
        }

        const { type, payload } = req.body;

        switch (type) {
            case 'SEND_MESSAGE':
                this.broker.publishCreate(payload);
                res.status(200).json({ success: true });
                break;

            case 'RECALL_MESSAGE':
                this.broker.publishRecall(payload);
                res.status(200).json({ success: true });
                break;

            case 'EDIT_MESSAGE':
                this.broker.publishEdit(payload);
                res.status(200).json({ success: true });
                break;

            default:
                res.status(400).json({ success: false, error: 'Unknown request type' });
        }
    }

    async handlePrivateMessagesRequest(req: Request, res: Response): Promise<void> {
        try {
            const senderId = req.query.senderId as string;
            const recipientId = req.query.recipientId as string;
            const limit = parseInt(req.query.limit as string) || 50;

            if (!senderId || !recipientId) {
                res.status(400).json({
                    success: false,
                    error: 'senderId and recipientId parameters are required'
                });
                return;
            }

            const messages = await this.messageStorage.getChatHistory(senderId, recipientId, limit);

            res.status(200).json({
                success: true,
                count: messages.length,
                data: messages
            });
        } catch (error) {
            console.error('Failed to retrieve private messages:', error);
            res.status(500).json({
                success: false,
                error: 'Error occurred while retrieving private messages'
            });
        }
    }

    async handlePublicMessagesRequest(req: Request, res: Response): Promise<void> {
        try {
            const limit = parseInt(req.query.limit as string) || 50;

            const query = {
                messageType: 'broadcast'
            };

            const messages = await this.messageStorage.getMessages(query, limit);

            res.status(200).json({
                success: true,
                count: messages.length,
                data: messages
            });
        } catch (error) {
            console.error('Failed to retrieve group messages:', error);
            res.status(500).json({
                success: false,
                error: 'Error occurred while retrieving group messages'
            });
        }
    }
}
