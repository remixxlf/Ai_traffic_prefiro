/**
 * API Route: Callback OAuth da Meta (PDF Seção 9)
 * GET /api/auth/meta/callback — recebe o code e descobre ativos
 */

import { NextRequest, NextResponse } from 'next/server';
import { MetaConnectionService } from '@/lib/services/meta-connection-service';

export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get('code');
  const empresaId = request.nextUrl.searchParams.get('state');

  if (!code || !empresaId) {
    return NextResponse.redirect(new URL('/integracoes?error=missing_params', request.url));
  }

  try {
    const service = new MetaConnectionService();

    // 1. Trocar code por token e salvar
    await service.processOAuthCallback(empresaId, code);

    // 2. Descobrir e persistir ativos
    await service.discoverAndSaveAssets(empresaId);

    return NextResponse.redirect(new URL(`/integracoes?empresaId=${empresaId}&success=true`, request.url));
  } catch (error: any) {
    console.error('Erro no callback OAuth Meta:', error);
    return NextResponse.redirect(new URL(`/integracoes?empresaId=${empresaId}&error=${encodeURIComponent(error.message)}`, request.url));
  }
}
