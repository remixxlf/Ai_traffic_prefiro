/**
 * API Route: Memória do Negócio (PDF Seção 46)
 * GET /api/business-memory?empresaId=xxx — retorna contexto do negócio para a IA
 */

import { NextRequest, NextResponse } from 'next/server';
import { BusinessMemoryService } from '@/lib/services/business-memory-service';

export async function GET(request: NextRequest) {
  try {
    const empresaId = request.nextUrl.searchParams.get('empresaId');

    if (!empresaId) {
      return NextResponse.json(
        { success: false, error: 'empresaId é obrigatório.' },
        { status: 400 }
      );
    }

    const service = new BusinessMemoryService();
    const context = await service.getBusinessContext(empresaId);

    return NextResponse.json({ success: true, context }, { status: 200 });
  } catch (error: any) {
    console.error('Erro ao buscar memória do negócio:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Erro interno.' },
      { status: 500 }
    );
  }
}
