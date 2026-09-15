/**
 * API Route: Score de Tráfego e Auditoria da Conta (PDF Seções 11 e 63)
 * GET /api/score?empresaId=xxx — retorna Score Geral, 6 Subscores e 11 Itens de Auditoria
 */

import { NextRequest, NextResponse } from 'next/server';
import { TrackingHealthService } from '@/lib/services/tracking-health-service';

export async function GET(request: NextRequest) {
  try {
    const empresaId = request.nextUrl.searchParams.get('empresaId');
    if (!empresaId) {
      return NextResponse.json({ error: 'empresaId é obrigatório.' }, { status: 400 });
    }

    const service = new TrackingHealthService();
    const [audit, trafficScore] = await Promise.all([
      service.auditAccountStructure(empresaId),
      service.calculateTrafficScore(empresaId)
    ]);

    return NextResponse.json({
      success: true,
      auditoria: audit,
      scoreTrafego: trafficScore
    });
  } catch (error: any) {
    console.error('Erro ao consultar score da conta:', error);
    return NextResponse.json({ error: error.message || 'Erro interno.' }, { status: 500 });
  }
}
