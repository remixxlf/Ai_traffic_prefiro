/**
 * API Route: Conciliação de Vendas e ROAS Real (PDF Seções 52 e 53)
 * GET /api/reconciliation?empresaId=xxx — relatório comparativo Meta vs Real
 * POST /api/reconciliation?empresaId=xxx — dispara conciliação dos pedidos com os anúncios
 */

import { NextRequest, NextResponse } from 'next/server';
import { RealSalesReconciliationService } from '@/lib/services/real-sales-service';

export async function GET(request: NextRequest) {
  try {
    const empresaId = request.nextUrl.searchParams.get('empresaId');
    if (!empresaId) {
      return NextResponse.json({ error: 'empresaId é obrigatório.' }, { status: 400 });
    }

    const service = new RealSalesReconciliationService();
    const relatorio = await service.getComparisonReport(empresaId);

    return NextResponse.json({ success: true, relatorio });
  } catch (error: any) {
    console.error('Erro ao buscar relatório de conciliação:', error);
    return NextResponse.json({ error: error.message || 'Erro interno.' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const empresaId = request.nextUrl.searchParams.get('empresaId');
    if (!empresaId) {
      return NextResponse.json({ error: 'empresaId é obrigatório.' }, { status: 400 });
    }

    const service = new RealSalesReconciliationService();
    const resultado = await service.reconcileCompanySales(empresaId);

    return NextResponse.json({
      success: true,
      mensagem: 'Vendas da Prefiro conciliadas com sucesso com as campanhas de tráfego.',
      resultado
    });
  } catch (error: any) {
    console.error('Erro ao conciliar vendas:', error);
    return NextResponse.json({ error: error.message || 'Erro na conciliação.' }, { status: 500 });
  }
}
