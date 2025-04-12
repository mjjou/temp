export type Handler = (payload: any) => Promise<any> | any;

const registry = new Map<string, Handler>();

export function registerHandler(command: string, handler: Handler) {
  registry.set(command, handler);
}

export function getHandler(command: string): Handler | undefined {
  return registry.get(command);
}