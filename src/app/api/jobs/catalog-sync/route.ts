/**
 * API Route: Worker de Sincronização Periódica de Catálogo (PDF Seção 29 e 70)
 * POST /api/jobs/catalog-sync — pode ser invocado por cron jobs (ex: a cada 1 hora)
 */

import { NextRequest, NextResponse } from 'next/server';
import { CatalogSyncWorker } from '@/lib/workers/catalog-sync-worker';

export async function POST(request: NextRequest) {
  try {
    const empresaId = request.nextUrl.searchParams.get('empresaId');
    const worker = new CatalogSyncWorker();

    if (empresaId) {
      const result = await worker.runSyncForEmpresa(empresaId);
      return NextResponse.json({
        success: result.success,
        modo: 'individual',
        resultado: result
      });
    }

    // Execução Global (job agendado a cada 1 hora)
    const summary = await worker.runGlobalSync();

    return NextResponse.json({
      success: true,
      modo: 'global',
      sumario: summary
    });
  } catch (error: any) {
    console.error('Erro na rota do job de catálogo:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Erro no job de catálogo.' },
      { status: 500 }
    );
  }
}
