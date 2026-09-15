/**
 * API Route: Dashboard Executivo Centrado no Negócio & Funil de Conversão
 * (PDF Seções 12, 54, 58, 59, 60, 88, 89)
 * GET /api/dashboard/executivo?empresaId=xxx&period=last_7d
 */

import { NextRequest, NextResponse } from 'next/server';
import { ExecutiveDashboardService } from '@/lib/services/executive-dashboard-service';

export async function GET(request: NextRequest) {
  try {
    const empresaId = request.nextUrl.searchParams.get('empresaId');
    const period = request.nextUrl.searchParams.get('period') || 'last_7d';

    if (!empresaId) {
      return NextResponse.json({ error: 'empresaId é obrigatório.' }, { status: 400 });
    }

    const service = new ExecutiveDashboardService();
    const [overview, funnel] = await Promise.all([
      service.getExecutiveOverview(empresaId, period),
      service.getConversionFunnel(empresaId, period)
    ]);

    return NextResponse.json({
      success: true,
      overview,
      funnel
    });
  } catch (error: any) {
    console.error('Erro ao buscar dados do dashboard executivo:', error);
    return NextResponse.json({ error: error.message || 'Erro interno.' }, { status: 500 });
  }
}
