import { BadRequestException, Body, Controller, Get, HttpCode, HttpStatus, Param, Post, Put, Req, UseGuards } from '@nestjs/common';
import { getOrganizationDiscoverySaveSchema } from '@integra/shared/requirements';
import type { Request } from 'express';
import { z } from 'zod';
import { ZodValidationPipe } from '../../middlewares/zod-validation.pipe';
import { SessionGuard } from '../auth/session.guard';
import { GuidedFlowsService } from './guided-flows.service';

@Controller('guided-flows/organization-discovery')
@UseGuards(SessionGuard)
export class GuidedFlowsController {
  constructor(private readonly guidedFlows: GuidedFlowsService) {}

  @Get()
  get(@Req() request: Request) {
    return this.guidedFlows.getOrganizationDiscovery(request.userId!);
  }

  @Put('steps/:step')
  saveStep(@Req() request: Request, @Param('step') rawStep: string, @Body() body: unknown) {
    const step = Number(rawStep);
    const schema = getOrganizationDiscoverySaveSchema(step);
    if (!schema) throw new BadRequestException({ error: {
      code: 'VALIDATION_ERROR', message: 'Invalid request.', fields: { step: 'Choose a step from 1 to 5.' },
    } });
    const input = new ZodValidationPipe(schema).transform(body);
    return this.guidedFlows.saveOrganizationDiscoveryStep(request.userId!, step, input);
  }

  @Post('complete')
  @HttpCode(HttpStatus.OK)
  complete(@Req() request: Request, @Body(new ZodValidationPipe(z.object({ revision: z.number().int().min(0) }).strict())) body: { revision: number }) {
    return this.guidedFlows.completeOrganizationDiscovery(request.userId!, body.revision);
  }
}
