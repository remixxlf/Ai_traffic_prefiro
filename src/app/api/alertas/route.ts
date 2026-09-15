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

    const alertas = await aiAssistantService.listarAlertas(empresaId);
    return NextResponse.json({ success: true, alertas });
  } catch (error: any) {
    console.error('Erro ao listar alertas:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Erro ao carregar alertas.' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { alertaId } = body;

    if (!alertaId) {
      return NextResponse.json(
        { success: false, error: 'alertaId é obrigatório.' },
        { status: 400 }
      );
    }

    const alerta = await aiAssistantService.marcarAlertaLido(alertaId);
    return NextResponse.json({ success: true, alerta });
  } catch (error: any) {
    console.error('Erro ao marcar alerta como lido:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Erro ao atualizar alerta.' },
      { status: 500 }
    );
  }
}
