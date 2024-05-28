import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { requestLogger } from './shared';
import { Logger } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.use(requestLogger);

  const config = new DocumentBuilder()
    .setTitle('Jobchain Service')
    .setDescription('The Jobchain API description')
    .setVersion('1.0')
    .addTag('resources')
    .addTag('auth')
    .addTag('users')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);

  SwaggerModule.setup('api', app, document);

  await app.listen(process.env.PORT, () =>
    Logger.log(`JobChain service listening at ${process.env.PORT}`),
  );
}
bootstrap();
