export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { aiAssistantService } from '@/lib/services/ai-assistant-service';

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

    const relatorio = await aiAssistantService.gerarRelatorioDiario(empresaId);
    return NextResponse.json({ success: true, relatorio });
  } catch (error: any) {
    console.error('Erro ao gerar relatório diário:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Erro ao carregar relatório diário.' },
      { status: 500 }
    );
  }
}
