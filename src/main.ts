import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { appSetup } from './setup/app.setup';
import localtunnel from 'localtunnel';
import ngrok from 'ngrok';
import cookieParser from 'cookie-parser';
import { NestExpressApplication } from '@nestjs/platform-express';

async function bootstrap() {

  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  const port = parseInt(process.env.PORT || '5001', 10);

  app.set('trust proxy', true);

  app.use(cookieParser());
  app.enableCors();

  appSetup(app); //глобальные настройки приложения

  const server = await app.listen(port);
  server.setTimeout(60000); // 60s

  if (false) {
    try {

      // const tunnel = await localtunnel({
      //   port,
      //   subdomain: process.env.TUNNEL_SUBDOMAIN || 'your-app-name', // опционально
      // });
      //
      // console.log('🌐 Public tunnel URL:', tunnel.url);
      // console.log('📡 Local server:', `http://localhost:${port}`);
      //
      // // Обработка событий туннеля
      // tunnel.on('close', () => {
      //   console.log('🔴 Tunnel closed');
      // });
      //
      // tunnel.on('error', (err) => {
      //   console.error('💥 Tunnel error:', err);
      // });
      //
      // // Сохраняем ссылку на туннель (опционально)
      // (global as any).tunnel = tunnel;

      // console.log('🌐 Connecting to ngrok...');
      //
      // // Используем ваш authtoken
      // const url = await ngrok.connect({
      //   addr: port,
      //   authtoken: '36cQSozy8nS4YKxosGWvCgMOhZ1_6xGnPjTT5Bo8vVHDhquxG',
      //   region: 'eu', // или 'eu', 'ap', 'au'
      //   onStatusChange: (status) => {
      //     console.log(`🔄 Ngdrok statuвs: ${status}`);
      //   },
      // });
      //
      // console.log('\n=========================================');
      // console.log('✅ NGROK TUNNEL ESTABLISHED!');
      // console.log('🌐 PUBLIC URL:', url);
      // console.log('📡 LOCAL URL:', `http://localhost:${port}`);
      // console.log('🌍 INSPECT:', 'http://localhost:4040');
      // console.log('=========================================\n');
      //
      // // Для тестов
      // console.log('📋 Use this for testing:');
      // console.log(`export TEST_URL="${url}"`);
      //
      // // Graceful shutdown
      // const shutdown = async () => {
      //   console.log('\n🔴 Closing ngrok tunnel...');
      //   await ngrok.kill();
      //   process.exit(0);
      // };
      //
      // process.on('SIGINT', shutdown);
      // process.on('SIGTERM', shutdown);

    } catch (error) {
      console.error('Failed to create tunnel:', error);
      console.log('Continuing without tunnel...');
    }
  }

}

bootstrap();
