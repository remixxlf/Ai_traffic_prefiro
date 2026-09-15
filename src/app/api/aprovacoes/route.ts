export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { approvalsInsightsService } from '@/lib/services/approvals-insights-service';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const empresaId = searchParams.get('empresaId');

    if (!empresaId) {
      return NextResponse.json(
        { success: false, error: 'empresaId é obrigatório.' },
        { status: 400 }
      );
    }

    const aprovacoes = await approvalsInsightsService.listarAprovacoesPendentes(empresaId);
    return NextResponse.json({ success: true, aprovacoes });
  } catch (error: any) {
    console.error('Erro ao listar aprovações:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Erro ao listar aprovações pendentes.' },
      { status: 500 }
    );
  }
}
