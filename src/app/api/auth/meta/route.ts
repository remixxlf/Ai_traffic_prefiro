/**
 * API Route: Iniciar conexão OAuth da Meta (PDF Seção 9)
 * GET /api/auth/meta — redireciona para o fluxo OAuth da Meta
 */

import { NextRequest, NextResponse } from 'next/server';
import { MetaConnectionService } from '@/lib/services/meta-connection-service';

export async function GET(request: NextRequest) {
  const empresaId = request.nextUrl.searchParams.get('empresaId');

  if (!empresaId) {
    return NextResponse.json({ error: 'empresaId é obrigatório.' }, { status: 400 });
  }

  const service = new MetaConnectionService();
  const oauthUrl = service.getOAuthUrl(empresaId);

  return NextResponse.redirect(oauthUrl);
}
