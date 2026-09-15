export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { campaignWizardService } from '@/lib/services/campaign-wizard-service';

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

    const recomendacao = await campaignWizardService.recomendarOrcamento(empresaId);
    return NextResponse.json({ success: true, recomendacao });
  } catch (error: any) {
    console.error('Erro ao recomendar orçamento:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Erro ao calcular recomendação de orçamento.' },
      { status: 500 }
    );
  }
}
