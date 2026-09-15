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

    const relatorio = await aiAssistantService.gerarRelatorioSemanal(empresaId);
    return NextResponse.json({ success: true, relatorio });
  } catch (error: any) {
    console.error('Erro ao gerar relatório semanal:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Erro ao carregar relatório semanal.' },
      { status: 500 }
    );
  }
}
