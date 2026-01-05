import { INestApplication } from '@nestjs/common';

// export const GLOBAL_PREFIX = 'api';
export const GLOBAL_PREFIX_SA = 'sa';

export function globalPrefixSetup(app: INestApplication) {
  //специальный метод, который добавляет ко всем маршрутам /GLOBAL_PREFIX
  // app.setGlobalPrefix(GLOBAL_PREFIX);
}
