export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { campaignWizardService } from '@/lib/services/campaign-wizard-service';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { empresaId, promptTexto } = body;

    if (!empresaId || !promptTexto) {
      return NextResponse.json(
        { success: false, error: 'empresaId e promptTexto são obrigatórios.' },
        { status: 400 }
      );
    }

    const interpretacao = await campaignWizardService.interpretarIntencao(empresaId, promptTexto);
    return NextResponse.json({ success: true, interpretacao });
  } catch (error: any) {
    console.error('Erro ao interpretar intenção:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Erro ao interpretar intenção da campanha.' },
      { status: 500 }
    );
  }
}
