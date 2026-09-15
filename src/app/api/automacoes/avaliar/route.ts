export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { policyEngineService } from '@/lib/services/policy-engine-service';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { empresaId } = body;

    if (!empresaId) {
      return NextResponse.json(
        { success: false, error: 'empresaId é obrigatório.' },
        { status: 400 }
      );
    }

    const execucoes = await policyEngineService.avaliarRegrasDeterministicas(empresaId);
    return NextResponse.json({ success: true, execucoes });
  } catch (error: any) {
    console.error('Erro ao avaliar regras determinísticas:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Erro ao avaliar regras de automação.' },
      { status: 500 }
    );
  }
}
