import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { RequirementsController } from './requirements.controller';
import { RequirementsRepository } from './requirements.repository';
import { RequirementsService } from './requirements.service';

@Module({
  imports: [AuthModule],
  controllers: [RequirementsController],
  providers: [RequirementsRepository, RequirementsService],
})
export class RequirementsModule {}
