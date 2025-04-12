import 'reflect-metadata';

const SERVICE_METADATA_KEY = Symbol('DI_PARAM_META_KEY');

export type ServiceIdentifier<T> = symbol & { __type?: T };

/**
 * Creates a unique ServiceIdentifier (symbol) for a given type.
 */
export function createService<T>(description: string): ServiceIdentifier<T> {
  return Symbol.for(description) as ServiceIdentifier<T>;
}

/**
 * A simple container that stores service instances or factories.
 */
export const container = new Map<symbol, any>();

/**
 * Parameter decorator for constructor injection.
 */
export function InjectService(serviceIdentifier: symbol) {
  return function (target: any, propertyKey: string | symbol, parameterIndex: number) {
    const existingInjectedParams =
      Reflect.getOwnMetadata(SERVICE_METADATA_KEY, target) || {};

    existingInjectedParams[parameterIndex] = serviceIdentifier;
    Reflect.defineMetadata(SERVICE_METADATA_KEY, existingInjectedParams, target);
  };
}

/**
 * Registers a service instance in the container.
 */
export function registerService<T>(id: ServiceIdentifier<T>, impl: T): void {
  container.set(id, impl);
}

/**
 * Retrieves a previously registered service instance from the container.
 */
export function getService<T>(id: ServiceIdentifier<T>): T {
  const svc = container.get(id);
  if (!svc) {
    throw new Error(`Service not found for id: ${id.toString()}`);
  }
  return svc;
}

/**
 * Creates an instance of a class, injecting services for parameters marked with @InjectService.
 */
export function createInstance<T>(target: new (...args: any[]) => T): T {
  const injectedParams: { [index: number]: symbol } =
    Reflect.getOwnMetadata(SERVICE_METADATA_KEY, target) || {};

  const paramTypes = Reflect.getMetadata('design:paramtypes', target) || [];

  const args = paramTypes.map((paramType: any, index: number) => {
    const serviceIdentifier = injectedParams[index];
    if (serviceIdentifier) {
      const dep = container.get(serviceIdentifier);
      if (!dep) {
        throw new Error(`No registered service found for symbol: ${serviceIdentifier.toString()} (index: ${index})`);
      }
      return dep;
    } else {
      if (paramType && typeof paramType === 'function') {
        return new paramType();
      }
      return undefined;
    }
  });

  return new target(...args);
}
