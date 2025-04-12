import { injectable, inject } from 'inversify';
import { Db, Collection, ObjectId } from 'mongodb';
import MessageBroker, {
    MessageType,
    MessageOperation,
    MessageHandler
} from './MessageBroker.js';

export interface ChatMessage {
    _id?: ObjectId;
    senderId: string;
    recipientId?: string;
    content: string;
    messageType: 'broadcast' | 'private';
    created_at: Date;
    isRead?: boolean;
    [key: string]: any;
}

interface MessageQuery {
    senderId?: string | RegExp | { $in: string[] } | { $eq: string };
    recipientId?: string | RegExp | { $in: string[] } | { $eq: string };
    messageType?: string | RegExp | { $in: string[] } | { $eq: string };
    content?: string | RegExp | { $in: string[] } | { $eq: string };
    isRead?: boolean | { $eq: boolean };
    created_at?: Date | { $gt?: Date, $lt?: Date, $eq?: Date };
    _id?: ObjectId | { $in: ObjectId[] };
    [key: string]: any;
}

@injectable()
export default class MessageStorage {
    private db: Db;
    private collection: Collection<ChatMessage>;
    private brokerSubscriptions: string[] = [];

    constructor(
        @inject('Db') db: Db,
        @inject('MessageBroker') private messageBroker: MessageBroker
    ) {
        this.db = db;
        this.collection = this.db.collection<ChatMessage>('chatMessages');
        this.setupBrokerSubscriptions();
    }


    private setupBrokerSubscriptions(): void {
        // Public Message Creation
        const publicCreateSub = this.messageBroker.subscribe(
            MessageType.PUBLIC,
            MessageOperation.CREATE,
            this.handlePublicMessageCreation.bind(this)
        );
        this.brokerSubscriptions.push(publicCreateSub);

        // Private Message Creation
        const privateCreateSub = this.messageBroker.subscribe(
            MessageType.PRIVATE,
            MessageOperation.CREATE,
            this.handlePrivateMessageCreation.bind(this)
        );
        this.brokerSubscriptions.push(privateCreateSub);

        // Public Message Recall
        const publicRecallSub = this.messageBroker.subscribe(
            MessageType.PUBLIC,
            MessageOperation.RECALL,
            this.handlePublicMessageRecall.bind(this)
        );
        this.brokerSubscriptions.push(publicRecallSub);

        // Private Message Recall
        const privateRecallSub = this.messageBroker.subscribe(
            MessageType.PRIVATE,
            MessageOperation.RECALL,
            this.handlePrivateMessageRecall.bind(this)
        );
        this.brokerSubscriptions.push(privateRecallSub);

        // Public Message Edit
        const publicEditSub = this.messageBroker.subscribe(
            MessageType.PUBLIC,
            MessageOperation.EDIT,
            this.handlePublicMessageEdit.bind(this)
        );
        this.brokerSubscriptions.push(publicEditSub);

        // Private Message Edit
        const privateEditSub = this.messageBroker.subscribe(
            MessageType.PRIVATE,
            MessageOperation.EDIT,
            this.handlePrivateMessageEdit.bind(this)
        );
        this.brokerSubscriptions.push(privateEditSub);
    }

    private async handlePublicMessageCreation(
        operation: MessageOperation,
        message: ChatMessage
    ): Promise<void> {
        try {
            await this.storeMessage(message as ChatMessage);
        } catch (error) {
            console.error('Error storing public message:', error);
        }
    }

    private async handlePrivateMessageCreation(
        operation: MessageOperation,
        message: ChatMessage
    ): Promise<void> {
        try {
            await this.storeMessage(message as ChatMessage);
        } catch (error) {
            console.error('Error storing private message:', error);
        }
    }

    private async handlePublicMessageRecall(
        operation: MessageOperation,
        message: ChatMessage
    ): Promise<void> {
        try {
            if (message.id) {
                await this.updateMessage(message.id, {
                    isRecalled: true,
                    content: 'Message has been recalled',
                    updated_at: new Date()
                });
            }
        } catch (error) {
            console.error('Error recalling public message:', error);
        }
    }

    private async handlePrivateMessageRecall(
        operation: MessageOperation,
        message: ChatMessage
    ): Promise<void> {
        try {
            if (message.id) {
                await this.updateMessage(message.id, {
                    isRecalled: true,
                    content: 'Message has been recalled',
                    updated_at: new Date()
                });
            }
        } catch (error) {
            console.error('Error recalling private message:', error);
        }
    }

    private async handlePublicMessageEdit(
        operation: MessageOperation,
        message: ChatMessage
    ): Promise<void> {
        try {
            if (message.id) {
                await this.updateMessage(message.id, {
                    content: message.content,
                    updated_at: new Date()
                });
            }
        } catch (error) {
            console.error('Error editing public message:', error);
        }
    }

    private async handlePrivateMessageEdit(
        operation: MessageOperation,
        message: ChatMessage
    ): Promise<void> {
        try {
            if (message.id) {
                await this.updateMessage(message.id, {
                    content: message.content,
                    updated_at: new Date()
                });
            }
        } catch (error) {
            console.error('Error editing private message:', error);
        }
    }

    /**
     * Store a new message in the database
     */
    async storeMessage(message: ChatMessage): Promise<string> {
        try {
            // Ensure timestamp exists using created_at instead of timestamp
            if (!message.created_at) {
                message.created_at = new Date();
            }

            // Set message type if not provided
            if (!message.messageType) {
                message.messageType = message.recipientId ? 'private' : 'broadcast';
            }

            // Set isRead to false for new messages if not provided
            if (message.isRead === undefined) {
                message.isRead = true;
            }

            const result = await this.collection.insertOne(message);
            console.log(`Message stored with ID: ${result.insertedId}`);
            return result.insertedId.toString();
        } catch (error) {
            console.error('Error storing message:', error);
            throw error;
        }
    }

    /**
     * Update an existing message
     */
    async updateMessage(messageId: string, updates: Partial<ChatMessage>): Promise<boolean> {
        try {
            const result = await this.collection.updateOne(
                { _id: new ObjectId(messageId) },
                { $set: updates }
            );

            console.log(`Message update status: ${result.modifiedCount > 0 ? 'Success' : 'No changes'}`);
            return result.modifiedCount > 0;
        } catch (error) {
            console.error('Error updating message:', error);
            throw error;
        }
    }

    /**
     * Get messages with optional filtering
     */
    async getMessages(query: MessageQuery = {}, limit: number = 50): Promise<ChatMessage[]> {
        try {
            const messages = await this.collection
                .find(query as any)
                .sort({ created_at: -1 }) // Most recent first, using created_at
                .limit(limit)
                .toArray();

            console.log(`Retrieved ${messages.length} messages`);
            return messages;
        } catch (error) {
            console.error('Error retrieving messages:', error);
            throw error;
        }
    }

    /**
     * Get chat history between users
     */
    async getChatHistory(userId1: string, userId2?: string, limit: number = 50): Promise<ChatMessage[]> {
        try {
            let query: any = {};

            if (userId2) {
                // Get conversation between two specific users
                query = {
                    $or: [
                        { senderId: userId1, recipientId: userId2 },
                        { senderId: userId2, recipientId: userId1 }
                    ]
                };
            } else {
                // Get all messages for a specific user
                query = {
                    $or: [
                        { senderId: userId1 },
                        { recipientId: userId1 }
                    ]
                };
            }

            const messages = await this.collection
                .find(query)
                .sort({ created_at: 1 }) // Oldest first for chat history
                .limit(limit)
                .toArray();

            console.log(`Retrieved ${messages.length} message history items`);
            return messages;
        } catch (error) {
            console.error('Error retrieving chat history:', error);
            throw error;
        }
    }

    /**
     * Delete messages
     */
    async deleteMessages(messageIds: string[]): Promise<number> {
        try {
            const objectIds = messageIds.map(id => new ObjectId(id));
            const result = await this.collection.deleteMany({
                _id: { $in: objectIds }
            });

            console.log(`Deleted ${result.deletedCount} messages`);
            return result.deletedCount;
        } catch (error) {
            console.error('Error deleting messages:', error);
            throw error;
        }
    }

    /**
     * Count unread messages
     */
    async countUnreadMessages(recipientId: string): Promise<number> {
        try {
            const count = await this.collection.countDocuments({
                recipientId,
                isRead: { $ne: true }
            });

            return count;
        } catch (error) {
            console.error('Error counting unread messages:', error);
            throw error;
        }
    }
}