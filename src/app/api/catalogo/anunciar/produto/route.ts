export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { catalogCampaignService } from '@/lib/services/catalog-campaign-service';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { empresaId, produtoId, orcamentoDiario } = body;

    if (!empresaId || !produtoId || !orcamentoDiario) {
      return NextResponse.json(
        { success: false, error: 'empresaId, produtoId e orcamentoDiario são obrigatórios.' },
        { status: 400 }
      );
    }

    const resultado = await catalogCampaignService.anunciarProduto({
      empresaId,
      produtoId,
      orcamentoDiario: Number(orcamentoDiario)
    });

    return NextResponse.json({ success: true, resultado });
  } catch (error: any) {
    console.error('Erro ao anunciar produto:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Erro ao anunciar produto.' },
      { status: 400 }
    );
  }
}
