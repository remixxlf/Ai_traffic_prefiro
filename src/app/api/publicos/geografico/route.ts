/**
 * API Route: Públicos Geográficos Locais (PDF Seção 21 e 22)
 * POST /api/publicos/geografico?empresaId=xxx
 */

import { NextRequest, NextResponse } from 'next/server';
import { LookalikeAndGeoAudienceService } from '@/lib/services/lookalike-geo-service';

export async function POST(request: NextRequest) {
  try {
    const empresaId = request.nextUrl.searchParams.get('empresaId');
    if (!empresaId) {
      return NextResponse.json({ error: 'empresaId é obrigatório.' }, { status: 400 });
    }

    const service = new LookalikeAndGeoAudienceService();
    const result = await service.createGeographicAudience(empresaId);

    return NextResponse.json({
      success: true,
      mensagem: 'Público geográfico local criado com sucesso!',
      publico: result.publico
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Erro ao criar público geográfico.' }, { status: 500 });
  }
}
