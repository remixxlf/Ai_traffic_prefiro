/**
 * API Route: Catálogo de Produtos (PDF Seções 28, 29, 30, 31, 32)
 * GET /api/catalogo?empresaId=xxx — retorna dados do catálogo e lista de produtos
 * POST /api/catalogo?empresaId=xxx — dispara sincronização imediata com o feed XML
 */

import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { CatalogIngestionService } from '@/lib/services/catalog-ingestion-service';

export async function GET(request: NextRequest) {
  const empresaId = request.nextUrl.searchParams.get('empresaId');

  if (!empresaId) {
    return NextResponse.json({ error: 'empresaId é obrigatório.' }, { status: 400 });
  }

  try {
    const catalogo = await db.metaCatalogo.findFirst({
      where: { empresa_id: empresaId }
    });

    const produtos = await db.metaProduto.findMany({
      where: { empresa_id: empresaId },
      orderBy: { nome: 'asc' }
    });

    return NextResponse.json({
      success: true,
      catalogo,
      produtos,
      resumo: {
        total: produtos.length,
        ativos: produtos.filter(p => p.status === 'ATIVO').length,
        inativos: produtos.filter(p => p.status !== 'ATIVO').length,
        comErro: catalogo?.error_products || 0,
        ultimaAtualizacao: catalogo?.last_sync_at,
        proximaAtualizacao: catalogo?.next_sync_at
      }
    });
  } catch (error: any) {
    console.error('Erro ao buscar catálogo:', error);
    return NextResponse.json({ error: error.message || 'Erro interno.' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const empresaId = request.nextUrl.searchParams.get('empresaId');

  if (!empresaId) {
    return NextResponse.json({ error: 'empresaId é obrigatório.' }, { status: 400 });
  }

  try {
    const service = new CatalogIngestionService();
    const result = await service.syncFromPrefiro(empresaId);

    return NextResponse.json({
      success: true,
      mensagem: 'Catálogo sincronizado com sucesso.',
      detalhes: result
    });
  } catch (error: any) {
    console.error('Erro ao sincronizar catálogo:', error);
    return NextResponse.json({ error: error.message || 'Erro ao sincronizar catálogo.' }, { status: 500 });
  }
}
