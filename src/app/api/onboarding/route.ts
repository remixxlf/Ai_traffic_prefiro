/**
 * API Route: Onboarding Wizard (PDF Seção 8)
 * POST /api/onboarding — processa cada passo do wizard
 */

import { NextRequest, NextResponse } from 'next/server';
import { OnboardingService } from '@/lib/services/onboarding-service';
import { z } from 'zod';

const OnboardingRequestSchema = z.object({
  step: z.union([z.literal(1), z.literal(2), z.literal(3), z.literal(4)]),
  empresaId: z.string().nullish(), // null | undefined aceitados (passo 1 ainda não tem empresa)
  usuarioId: z.string(),
  data: z.record(z.string(), z.any())
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = OnboardingRequestSchema.parse(body);

    const service = new OnboardingService();
    const empresa = await service.processStep(
      {
        step: parsed.step,
        empresaId: parsed.empresaId ?? undefined, // null → undefined para o serviço
        data: parsed.data
      },
      parsed.usuarioId
    );

    return NextResponse.json({ success: true, empresa }, { status: 200 });
  } catch (error: any) {
    console.error('Erro no onboarding:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Erro interno no onboarding.' },
      { status: 400 }
    );
  }
}
