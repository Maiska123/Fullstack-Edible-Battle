import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';

export interface IAppConfig {
  apiUri: string;
}

@Injectable({
  providedIn: 'root'
})
export class ConfigService {
public static settings: IAppConfig;

constructor() { }

public static loadStatic(): Promise<void> {
  const configAsJsonFile = `assets/config/config.${environment.name}.json`

  return new Promise<void>((resolve, reject) => {
    fetch(configAsJsonFile)
    .then((response) => {
      response.json().then((setting: IAppConfig) => {
        ConfigService.settings = setting as IAppConfig;
        resolve()
      } ).catch((response: any) => {
        reject(`Couldn\'t load setting-file "${configAsJsonFile}": ${JSON.stringify(response)}`)
      })
    }).catch((response: any) => {
      reject(`Couldn\'t load setting-file "${configAsJsonFile}": ${JSON.stringify(response)}`)
    })
  })
}
}
