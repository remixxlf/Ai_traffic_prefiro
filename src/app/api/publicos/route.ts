/**
 * API Route: Biblioteca de Públicos (PDF Seção 23)
 * GET /api/publicos?empresaId=xxx
 */

import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const empresaId = request.nextUrl.searchParams.get('empresaId');

    if (!empresaId) {
      return NextResponse.json({ error: 'empresaId é obrigatório.' }, { status: 400 });
    }

    const publicos = await db.publico.findMany({
      where: { empresa_id: empresaId },
      orderBy: { created_at: 'desc' }
    });

    return NextResponse.json({
      success: true,
      publicos,
      total: publicos.length
    });
  } catch (error: any) {
    console.error('Erro ao listar públicos:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Erro interno ao listar públicos.' },
      { status: 500 }
    );
  }
}
