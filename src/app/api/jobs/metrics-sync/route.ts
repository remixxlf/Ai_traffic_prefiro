/**
 * API Route: Worker de Métricas da Meta (PDF Seção 70 e 71)
 * POST /api/jobs/metrics-sync?empresaId=xxx — aciona sincronização e cache de métricas
 */

import { NextRequest, NextResponse } from 'next/server';
import { MetaMetricsSyncWorker } from '@/lib/workers/meta-metrics-worker';

export async function POST(request: NextRequest) {
  try {
    const empresaId = request.nextUrl.searchParams.get('empresaId') || undefined;
    const worker = new MetaMetricsSyncWorker();
    const result = await worker.syncAllActiveCampaigns(empresaId);

    return NextResponse.json({
      success: true,
      mensagem: 'Métricas da Meta sincronizadas e salvas em cache no banco interno.',
      resultado: result
    });
  } catch (error: any) {
    console.error('Erro no worker de métricas da Meta:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Erro ao sincronizar métricas.' },
      { status: 500 }
    );
  }
}
