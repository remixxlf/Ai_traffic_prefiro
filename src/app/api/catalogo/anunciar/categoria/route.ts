export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { catalogCampaignService } from '@/lib/services/catalog-campaign-service';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { empresaId, categoria, orcamentoDiario } = body;

    if (!empresaId || !categoria || !orcamentoDiario) {
      return NextResponse.json(
        { success: false, error: 'empresaId, categoria e orcamentoDiario são obrigatórios.' },
        { status: 400 }
      );
    }

    const resultado = await catalogCampaignService.anunciarCategoria({
      empresaId,
      categoria,
      orcamentoDiario: Number(orcamentoDiario)
    });

    return NextResponse.json({ success: true, resultado });
  } catch (error: any) {
    console.error('Erro ao anunciar categoria:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Erro ao anunciar categoria.' },
      { status: 400 }
    );
  }
}
