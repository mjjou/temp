import { injectable } from 'inversify';

@injectable()
export class GatewayService {
  async init(): Promise<void> {
    console.log('Gateway Service initialized.');
  }
}
