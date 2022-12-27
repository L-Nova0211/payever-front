import { Compiler, Injector, ModuleWithProviders, NgModuleFactory, StaticProvider } from '@angular/core';

export class LazyNgModuleWithProvidersFactory<T> extends NgModuleFactory<T> {

  constructor(private moduleWithProviders: ModuleWithProviders<T>) {
    super();
  }

  get moduleType() {
    return this.moduleWithProviders.ngModule;
  }

  create(parentInjector: Injector | null) {
    const injector = Injector.create({
      providers: this.moduleWithProviders.providers as StaticProvider[],
      parent: parentInjector,
    });

    const compiler = injector.get(Compiler);
    const factory = compiler.compileModuleSync(this.moduleType);

    return factory.create(injector);
  }
}
