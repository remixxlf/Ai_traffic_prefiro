/**
 * API Route: Biblioteca de Criativos (PDF Seções 35, 37, 39)
 * GET /api/criativos?empresaId=xxx — lista criativos e métricas
 * POST /api/criativos — cadastra novo criativo vinculado a produto
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
    const criativos = await service.getCreativesLibrary(empresaId);

    return NextResponse.json({ success: true, criativos });
  } catch (error: any) {
    console.error('Erro ao listar criativos:', error);
    return NextResponse.json({ error: error.message || 'Erro interno.' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { empresaId, ...dados } = body;

    if (!empresaId || !dados.nome) {
      return NextResponse.json({ error: 'empresaId e nome são obrigatórios.' }, { status: 400 });
    }

    const service = new CreativeFatigueService();
    const criativo = await service.createCreative(empresaId, dados);

    return NextResponse.json({
      success: true,
      mensagem: 'Criativo cadastrado na biblioteca com sucesso.',
      criativo
    });
  } catch (error: any) {
    console.error('Erro ao criar criativo:', error);
    return NextResponse.json({ error: error.message || 'Erro ao criar criativo.' }, { status: 500 });
  }
}
