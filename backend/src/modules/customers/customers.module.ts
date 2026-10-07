import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { CustomersController } from './customers.controller';
import { CustomersRepository } from './customers.repository';
import { CustomersService } from './customers.service';
import { StorageModule } from '../storage/storage.module';

@Module({ imports: [AuthModule, StorageModule], controllers: [CustomersController], providers: [CustomersRepository, CustomersService] })
export class CustomersModule {}
