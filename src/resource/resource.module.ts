import { MiddlewareConsumer, Module } from '@nestjs/common';
import { ResourceController } from './controllers';
import { ResourceService } from './services';
import { Resource, ResourceSchema } from './schemas';
import { MongooseModule } from '@nestjs/mongoose';
import { JwtModule } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { CompanyMiddleware } from './middlewares';
import { AuthMiddleware } from '@/shared';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Resource.name, schema: ResourceSchema },
    ]),
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        global: true,
        secret: config.get('JWT_SECRET'),
        signOptions: { expiresIn: '15m' },
      }),
    }),
  ],
  controllers: [ResourceController],
  providers: [ResourceService],
  exports: [ResourceService],
})
export class ResourceModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(AuthMiddleware)
      .forRoutes(ResourceController)
      .apply(CompanyMiddleware)
      .forRoutes('resources/audit');
  }
}
