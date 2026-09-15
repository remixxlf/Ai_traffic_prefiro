/**
 * API Route: Consulta de Métricas e Comparativo (PDF Seções 60, 71, 73)
 * GET /api/metricas?empresaId=xxx&period=last_7d
 */

import { NextRequest, NextResponse } from 'next/server';
import { MetricsQueryService } from '@/lib/services/metrics-query-service';

export async function GET(request: NextRequest) {
  try {
    const empresaId = request.nextUrl.searchParams.get('empresaId');
    const period = request.nextUrl.searchParams.get('period') || 'last_7d';

    if (!empresaId) {
      return NextResponse.json({ error: 'empresaId é obrigatório.' }, { status: 400 });
    }

    const service = new MetricsQueryService();
    const [summary, comparative] = await Promise.all([
      service.getEmpresaMetricsSummary(empresaId, period),
      service.getComparativeAnalysis(empresaId, '7d_vs_previous_7d')
    ]);

    return NextResponse.json({
      success: true,
      periodo: period,
      resumo: summary,
      comparativo: comparative
    });
  } catch (error: any) {
    console.error('Erro ao consultar métricas:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Erro ao consultar métricas.' },
      { status: 500 }
    );
  }
}
