import { registerGatewayServices } from './services/gateway/index.js';
import { getService } from './platform/di/container.js';
import { IGatewayService } from './services/gateway/gateway.service.js';

async function bootstrap() {
  registerGatewayServices();
  const gateway = getService(IGatewayService);
  await gateway.init();
  // ...
}

bootstrap().catch(err => {
  console.error('App bootstrap failed:', err);
  process.exit(1);
});
