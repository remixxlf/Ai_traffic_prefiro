/**
 * API Route: Públicos Semelhantes (Lookalikes) (PDF Seção 26 e 89)
 * GET /api/publicos/lookalike?empresaId=xxx — verifica elegibilidade
 * POST /api/publicos/lookalike?empresaId=xxx — cria o público semelhante
 */

import { NextRequest, NextResponse } from 'next/server';
import { LookalikeAndGeoAudienceService } from '@/lib/services/lookalike-geo-service';

export async function GET(request: NextRequest) {
  try {
    const empresaId = request.nextUrl.searchParams.get('empresaId');
    if (!empresaId) {
      return NextResponse.json({ error: 'empresaId é obrigatório.' }, { status: 400 });
    }

    const service = new LookalikeAndGeoAudienceService();
    const eligibility = await service.checkLookalikeEligibility(empresaId);

    return NextResponse.json({ success: true, ...eligibility });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Erro ao verificar elegibilidade.' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const empresaId = request.nextUrl.searchParams.get('empresaId');
    if (!empresaId) {
      return NextResponse.json({ error: 'empresaId é obrigatório.' }, { status: 400 });
    }

    const body = await request.json().catch(() => ({}));
    const service = new LookalikeAndGeoAudienceService();
    const result = await service.createLookalikeAudience(empresaId, {
      ratio: body.ratio || 0.01,
      country: body.country || 'BR'
    });

    return NextResponse.json({
      success: true,
      mensagem: 'Público semelhante criado com sucesso!',
      publico: result.publico
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Erro ao criar público semelhante.' }, { status: 500 });
  }
}
