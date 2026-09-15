/**
 * API Route: Central de Integrações (PDF Seção 10)
 * GET /api/integracoes?empresaId=xxx — retorna status de todas integrações
 * DELETE /api/integracoes?empresaId=xxx — desconecta a integração Meta
 */

import { NextRequest, NextResponse } from 'next/server';
import { MetaConnectionService } from '@/lib/services/meta-connection-service';

export async function GET(request: NextRequest) {
  const empresaId = request.nextUrl.searchParams.get('empresaId');

  if (!empresaId) {
    return NextResponse.json({ error: 'empresaId é obrigatório.' }, { status: 400 });
  }

  try {
    const service = new MetaConnectionService();
    const status = await service.getIntegrationStatus(empresaId);
    return NextResponse.json({ success: true, ...status });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  const empresaId = request.nextUrl.searchParams.get('empresaId');

  if (!empresaId) {
    return NextResponse.json({ error: 'empresaId é obrigatório.' }, { status: 400 });
  }

  try {
    const service = new MetaConnectionService();
    await service.disconnect(empresaId);
    return NextResponse.json({ success: true, message: 'Integração Meta desconectada.' });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
