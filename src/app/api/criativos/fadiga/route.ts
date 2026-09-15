/**
 * API Route: Módulo de Detecção de Fadiga de Criativo (PDF Seção 40)
 * GET /api/criativos/fadiga?empresaId=xxx — executa diagnóstico de saturação
 */

import { NextRequest, NextResponse } from 'next/server';
import { CreativeFatigueService } from '@/lib/services/creative-fatigue-service';

export async function GET(request: NextRequest) {
  try {
    const empresaId = request.nextUrl.searchParams.get('empresaId');
    if (!empresaId) {
      return NextResponse.json({ error: 'empresaId é obrigatório.' }, { status: 400 });
    }

    const service = new CreativeFatigueService();
    const diagnostico = await service.analyzeFatigue(empresaId);

    return NextResponse.json({
      success: true,
      diagnostico
    });
  } catch (error: any) {
    console.error('Erro ao analisar fadiga de criativos:', error);
    return NextResponse.json({ error: error.message || 'Erro interno.' }, { status: 500 });
  }
}
