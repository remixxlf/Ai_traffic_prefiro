export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { campaignWizardService } from '@/lib/services/campaign-wizard-service';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const empresaId = searchParams.get('empresaId');

    if (!empresaId) {
      return NextResponse.json(
        { success: false, error: 'O parâmetro empresaId é obrigatório.' },
        { status: 400 }
      );
    }

    const campanhas = await campaignWizardService.listarCampanhas(empresaId);
    return NextResponse.json({ success: true, campanhas });
  } catch (error: any) {
    console.error('Erro ao listar campanhas:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Erro ao listar campanhas.' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { empresaId, ...payload } = body;

    if (!empresaId) {
      return NextResponse.json(
        { success: false, error: 'empresaId é obrigatório.' },
        { status: 400 }
      );
    }

    const resultado = await campaignWizardService.criarCampanhaCompleta(empresaId, payload);
    return NextResponse.json({ success: true, resultado });
  } catch (error: any) {
    console.error('Erro ao criar campanha:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Erro ao criar campanha na Meta.' },
      { status: 400 }
    );
  }
}
