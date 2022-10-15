import { ConfigService } from './app/services/config.service';
import { enableProdMode } from '@angular/core';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';

import { AppModule } from './app/app.module';
import { environment } from './environments/environment';

if (environment.production) {
  enableProdMode();
}

ConfigService.loadStatic()
  .then(()=> {
    platformBrowserDynamic().bootstrapModule(AppModule).then(()=>{
      if('serviceworker' in navigator){ navigator.serviceWorker.register('ngsw-worker.js') }
    }).catch(err => console.error(err));
  }).catch(err => console.error(err));
