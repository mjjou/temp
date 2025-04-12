import { registerService } from '../../platform/di/container.js';
import { IGatewayService, GatewayService } from './gateway.service.js';

export function registerGatewayServices() {
  registerService(IGatewayService, new GatewayService());
}