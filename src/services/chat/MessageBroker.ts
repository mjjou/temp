import { EventEmitter } from 'events';
import { ChatMessage } from './MessageStorage.js';

export enum MessageType {
  PRIVATE = 'private',
  PUBLIC = 'public'
}

export enum MessageOperation {
  CREATE = 'create',
  RECALL = 'recall',
  EDIT = 'edit'
}

export type MessageHandler = (operation: MessageOperation, message: ChatMessage) => void;

export default class MessageBroker {
  private eventEmitter: EventEmitter;
  private subscriptions: Map<string, { topic: string; handler: MessageHandler }>;

  constructor() {
    this.eventEmitter = new EventEmitter();
    this.eventEmitter.setMaxListeners(100);
    this.subscriptions = new Map();
  }

  public init(): void {
    console.log('Message Broker initialized');
  }

  public subscribe(
    messageType: MessageType,
    operation: MessageOperation,
    handler: MessageHandler
  ): string {
    const subscriptionId = `sub_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    const topic = this.createTopicPattern(messageType, operation);

    this.subscriptions.set(subscriptionId, { topic, handler });
    this.eventEmitter.on(topic, (op: MessageOperation, msg: ChatMessage) => {
      handler(op, msg);
    });
    console.log(`Subscription created: ${subscriptionId} for ${topic}`);
    return subscriptionId;
  }

  public unsubscribe(subscriptionId: string): boolean {
    const subscription = this.subscriptions.get(subscriptionId);
    if (!subscription) {
      console.warn(`Subscription not found: ${subscriptionId}`);
      return false;
    }
    // Remove listener
    this.eventEmitter.removeAllListeners(subscription.topic);
    this.subscriptions.delete(subscriptionId);
    console.log(`Unsubscribed: ${subscriptionId}`);
    return true;
  }

  public publishCreate(message: ChatMessage): void {
    const topic = `${message.messageType}.${MessageOperation.CREATE}`;
    console.log(`Publishing message creation: ${topic}`);
    this.eventEmitter.emit(topic, MessageOperation.CREATE, message);
  }

  public publishRecall(message: ChatMessage): void {
    const topic = `${message.messageType}.${MessageOperation.RECALL}`;
    console.log(`Publishing message recall: ${topic}`);
    this.eventEmitter.emit(topic, MessageOperation.RECALL, message);
  }

  public publishEdit(message: ChatMessage): void {
    const topic = `${message.messageType}.${MessageOperation.EDIT}`;
    console.log(`Publishing message edit: ${topic}`);
    this.eventEmitter.emit(topic, MessageOperation.EDIT, message);
  }

  private createTopicPattern(messageType: MessageType, operation: MessageOperation): string {
    return `${messageType}.${operation}`;
  }
}
