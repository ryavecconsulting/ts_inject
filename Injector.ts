export type Inject<T> = (injector: Injector) => () => T;

export interface Injectable<T> {
  inject?: Inject<T>;
}

export class Injector {

  private providers: Map<Injectable<any>, () => any> = new Map();

  public bind<T>(injectable: Injectable<T>, toInjectable: Injectable<T>) {
    this.providers.set(injectable, this.get(toInjectable));
  }

  public register<T>(injectable: Injectable<T>): (() => T)|undefined {
    if (this.providers.has(injectable)) {
      throw new Error(`Provider already registered for ${injectable}`);
    }
    if (injectable.inject) {
      const provider = injectable.inject(this);
      this.providers.set(injectable, provider);
      return provider;
    }
    return undefined;
  }

  public get<T>(injectable: Injectable<T>): () => T {
    let provider = this.providers.get(injectable);
    if (!provider) {
      provider = this.register(injectable);
    }
    if (!provider) {
      throw new Error(`Provider not found for ${injectable}`);
    }
    return provider;
  }

}

export function singletonInject<T>(instanceInject: Inject<T>): Inject<T> {
  return (injector) => {
    let instance: T|undefined = undefined;
    return () => {
      if (!instance) {
        instance = instanceInject(injector)();
      }
      return instance;
    };
  };
}
