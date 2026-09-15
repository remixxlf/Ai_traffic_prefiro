export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { catalogCampaignService } from '@/lib/services/catalog-campaign-service';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { empresaId, orcamentoDiario } = body;

    if (!empresaId || !orcamentoDiario) {
      return NextResponse.json(
        { success: false, error: 'empresaId e orcamentoDiario são obrigatórios.' },
        { status: 400 }
      );
    }

    const resultado = await catalogCampaignService.anunciarTodoCardapio({
      empresaId,
      orcamentoDiario: Number(orcamentoDiario)
    });

    return NextResponse.json({ success: true, resultado });
  } catch (error: any) {
    console.error('Erro ao anunciar cardápio completo:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Erro ao anunciar cardápio completo.' },
      { status: 400 }
    );
  }
}
