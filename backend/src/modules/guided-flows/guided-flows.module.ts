import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { GuidedFlowsController } from './guided-flows.controller';
import { GuidedFlowsRepository } from './guided-flows.repository';
import { GuidedFlowsService } from './guided-flows.service';

@Module({
  imports: [AuthModule],
  controllers: [GuidedFlowsController],
  providers: [GuidedFlowsRepository, GuidedFlowsService],
})
export class GuidedFlowsModule {}
