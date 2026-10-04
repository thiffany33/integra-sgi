import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './infra/prisma/prisma.module';
import { AuthModule } from './modules/auth/auth.module';
import { CustomersModule } from './modules/customers/customers.module';
import { RequirementsModule } from './modules/requirements/requirements.module';
import { HealthModule } from './modules/health/health.module';
import { validateEnvironment } from './config/configuration';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, validate: validateEnvironment }),
    PrismaModule,
    AuthModule,
    CustomersModule,
    RequirementsModule,
    HealthModule,
  ],
})
export class AppModule {}
