export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { approvalsInsightsService } from '@/lib/services/approvals-insights-service';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { aprovacaoId, decisao, motivoRecusa, usuarioId } = body;

    if (!aprovacaoId || !decisao) {
      return NextResponse.json(
        { success: false, error: 'aprovacaoId e decisao (APROVAR ou RECUSAR) são obrigatórios.' },
        { status: 400 }
      );
    }

    const resultado = await approvalsInsightsService.decidirAprovacao({
      aprovacaoId,
      decisao,
      motivoRecusa,
      usuarioId
    });

    return NextResponse.json({ success: true, resultado });
  } catch (error: any) {
    console.error('Erro ao decidir aprovação:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Erro ao processar decisão de aprovação.' },
      { status: 500 }
    );
  }
}
