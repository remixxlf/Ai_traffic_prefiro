/**
 * API Route: Diagnóstico de Rastreamento (Pixel & Conversion API)
 * (PDF Seções 55, 56, 57)
 * GET /api/tracking?empresaId=xxx — status do rastreamento
 * POST /api/tracking — dispara evento server-side CAPI
 */

import { NextRequest, NextResponse } from 'next/server';
import { TrackingHealthService } from '@/lib/services/tracking-health-service';

export async function GET(request: NextRequest) {
  try {
    const empresaId = request.nextUrl.searchParams.get('empresaId');
    if (!empresaId) {
      return NextResponse.json({ error: 'empresaId é obrigatório.' }, { status: 400 });
    }

    const service = new TrackingHealthService();
    const diagnostico = await service.getTrackingDiagnostics(empresaId);

    return NextResponse.json({ success: true, diagnostico });
  } catch (error: any) {
    console.error('Erro ao buscar diagnóstico de rastreamento:', error);
    return NextResponse.json({ error: error.message || 'Erro interno.' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { empresaId, eventName, eventData, userData } = body;

    if (!empresaId || !eventName) {
      return NextResponse.json({ error: 'empresaId e eventName são obrigatórios.' }, { status: 400 });
    }

    const service = new TrackingHealthService();
    const resultado = await service.dispatchCapiEvent(empresaId, {
      eventName,
      eventData,
      userData
    });

    return NextResponse.json({
      success: true,
      mensagem: `Evento ${eventName} enviado com sucesso via Conversion API.`,
      resultado
    });
  } catch (error: any) {
    console.error('Erro ao despachar evento CAPI:', error);
    return NextResponse.json({ error: error.message || 'Erro no envio CAPI.' }, { status: 500 });
  }
}
