export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { policyEngineService, ModoOperacao } from '@/lib/services/policy-engine-service';

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

    const config = await policyEngineService.obterConfiguracao(empresaId);
    return NextResponse.json({ success: true, config });
  } catch (error: any) {
    console.error('Erro ao buscar configuração de automação:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Erro ao carregar configuração.' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { empresaId, modo, orcamentoMaxDiario } = body;

    if (!empresaId || !modo) {
      return NextResponse.json(
        { success: false, error: 'empresaId e modo são obrigatórios.' },
        { status: 400 }
      );
    }

    const empresa = await policyEngineService.atualizarModoOperacao(
      empresaId,
      modo as ModoOperacao,
      orcamentoMaxDiario ? Number(orcamentoMaxDiario) : undefined
    );

    return NextResponse.json({ success: true, empresa });
  } catch (error: any) {
    console.error('Erro ao salvar modo de operação:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Erro ao atualizar modo de operação.' },
      { status: 500 }
    );
  }
}
