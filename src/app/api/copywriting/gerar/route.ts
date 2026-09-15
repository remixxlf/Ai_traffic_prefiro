/**
 * API Route: Gerador de Copywriting com IA (PDF Seções 36 e 37)
 * POST /api/copywriting/gerar — gera 3 variações estratégicas de copy para anúncios
 */

import { NextRequest, NextResponse } from 'next/server';
import { CopywritingService } from '@/lib/services/copywriting-service';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { empresaId, produtoNome, preco, precoPromocional, ganchoEspecial } = body;

    if (!empresaId) {
      return NextResponse.json({ error: 'empresaId é obrigatório.' }, { status: 400 });
    }

    const service = new CopywritingService();
    const resultado = await service.generateStrategicCopies({
      empresaId,
      produtoNome,
      preco: preco ? parseFloat(preco) : undefined,
      precoPromocional: precoPromocional ? parseFloat(precoPromocional) : undefined,
      ganchoEspecial
    });

    return NextResponse.json({
      success: true,
      resultado
    });
  } catch (error: any) {
    console.error('Erro ao gerar copies com IA:', error);
    return NextResponse.json({ error: error.message || 'Erro ao gerar cópias.' }, { status: 500 });
  }
}
