import express, { Request, Response } from 'express';
import { getHandler } from '../../platform/dispatcher.js';
import { createService, ServiceIdentifier } from '../../platform/di/container.js';

export interface IGatewayService {
  init(): void;
}

export const IGatewayService: ServiceIdentifier<IGatewayService> =
  createService<IGatewayService>('gateway-service');

export class GatewayService implements IGatewayService {
  public init(): void {
    const app = express();
    app.use(express.json());

    app.post('/api/command', async (req: Request, res: Response): Promise<void> => {
      const { type, payload } = req.body;
      const handler = getHandler(type);
      if (!handler) {
        res.status(404).json({ error: `No handler found for type: ${type}` });
        return;
      }
      try {
        const result = await handler(payload);
        res.json({ ok: true, result });
      } catch (err) {
        res.status(500).json({ error: String(err) });
      }
    });

    app.listen(3001, () => {
      console.log('[GatewayService] listening on http://localhost:3001');
    });
  }
}
