export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { policyEngineService } from '@/lib/services/policy-engine-service';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { empresaId, tipoAcao, entidadeTipo, entidadeId, valorProposto, motivo } = body;

    if (!empresaId || !tipoAcao || !entidadeTipo || !entidadeId) {
      return NextResponse.json(
        { success: false, error: 'Parâmetros insuficientes para propor ação.' },
        { status: 400 }
      );
    }

    const resultado = await policyEngineService.avaliarAcao({
      empresaId,
      tipoAcao,
      entidadeTipo,
      entidadeId,
      valorProposto: valorProposto ? Number(valorProposto) : undefined,
      motivo: motivo || 'Ação gerada pelo motor inteligente'
    });

    return NextResponse.json({ success: true, resultado });
  } catch (error: any) {
    console.error('Erro ao processar ação no Policy Engine:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Erro ao avaliar ação no Policy Engine.' },
      { status: 500 }
    );
  }
}
