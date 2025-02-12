import { injectable } from 'inversify';

@injectable()
export default class ChatService {
  async init(): Promise<void> {
    console.log('Chat Service initialized.');
  }
}
