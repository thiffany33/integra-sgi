import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './infra/prisma/prisma.module';
import { AuthModule } from './modules/auth/auth.module';
import { CustomersModule } from './modules/customers/customers.module';
import { RequirementsModule } from './modules/requirements/requirements.module';
import { HealthModule } from './modules/health/health.module';
import { AdminModule } from './modules/admin/admin.module';
import { StorageModule } from './modules/storage/storage.module';
import { FilesModule } from './modules/files/files.module';
import { AuditModule } from './modules/audit/audit.module';
import { RetentionModule } from './modules/retention/retention.module';
import { AccountModule } from './modules/account/account.module';
import { ContactModule } from './modules/contact/contact.module';
import { GuidedFlowsModule } from './modules/guided-flows/guided-flows.module';
import { validateEnvironment } from './config/configuration';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, validate: validateEnvironment }),
    PrismaModule,
    AuditModule,
    RetentionModule,
    AuthModule,
    CustomersModule,
    RequirementsModule,
    HealthModule,
    AdminModule,
    StorageModule,
    FilesModule,
    GuidedFlowsModule,
    ContactModule,
    AccountModule,
  ],
})
export class AppModule {}
