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

    const visao = await approvalsInsightsService.obterVisaoMinhaIa(empresaId);
    return NextResponse.json({ success: true, visao });
  } catch (error: any) {
    console.error('Erro ao obter visão Minha IA:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Erro ao carregar Minha IA.' },
      { status: 500 }
    );
  }
}
