import { Compiler, Injector } from '@angular/core';

import { EncryptionService } from '@pe/encryption';

export async function loadEncryptionModule(compiler: Compiler, injector: Injector): Promise<EncryptionService> {
  return import('@pe/encryption').then(({ EncryptionModule, EncryptionService }) =>
    compiler.compileModuleAsync(EncryptionModule).then((moduleFactory) => {
      const module = moduleFactory.create(injector);
      const service = module.injector.get(EncryptionService);

      return service;
    }),
  );
}
