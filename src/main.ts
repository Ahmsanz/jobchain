import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { requestLogger } from './shared';
import { Logger } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.use(requestLogger);
  await app.listen(process.env.PORT, () =>
    Logger.log(`JobChain service listening at ${process.env.PORT}`),
  );
}
bootstrap();
