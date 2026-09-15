export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { aiAssistantService } from '@/lib/services/ai-assistant-service';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { empresaId, mensagem, historico } = body;

    if (!empresaId || !mensagem) {
      return NextResponse.json(
        { success: false, error: 'empresaId e mensagem são obrigatórios.' },
        { status: 400 }
      );
    }

    const resposta = await aiAssistantService.processarChat({
      empresaId,
      mensagem,
      historico
    });

    return NextResponse.json({ success: true, resposta });
  } catch (error: any) {
    console.error('Erro no Chat com IA:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Erro ao processar mensagem do chat.' },
      { status: 500 }
    );
  }
}
