import { createService, ServiceIdentifier } from "../../platform/di/container.js";

export const IGatewayService: ServiceIdentifier<GatewayService> = createService<GatewayService>('gateway-service');

export class GatewayService {
  async init(): Promise<void> {
    console.log('Gateway Service initialized.');
  }
}