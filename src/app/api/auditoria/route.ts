export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { approvalsInsightsService } from '@/lib/services/approvals-insights-service';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const empresaId = searchParams.get('empresaId');
    const limit = searchParams.get('limit') ? Number(searchParams.get('limit')) : 50;

    if (!empresaId) {
      return NextResponse.json(
        { success: false, error: 'empresaId é obrigatório.' },
        { status: 400 }
      );
    }

    const historico = await approvalsInsightsService.listarHistoricoAuditoria(empresaId, limit);
    return NextResponse.json({ success: true, historico });
  } catch (error: any) {
    console.error('Erro ao consultar histórico de auditoria:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Erro ao carregar histórico auditável.' },
      { status: 500 }
    );
  }
}
