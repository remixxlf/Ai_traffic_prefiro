/**
 * API Route: Sincronização de Públicos Personalizados da Prefiro (PDF Seção 25)
 * POST /api/publicos/sync-clientes?empresaId=xxx
 */

import { NextRequest, NextResponse } from 'next/server';
import { CustomerAudienceService } from '@/lib/services/customer-audience-service';

export async function POST(request: NextRequest) {
  try {
    const empresaId = request.nextUrl.searchParams.get('empresaId');

    if (!empresaId) {
      return NextResponse.json({ error: 'empresaId é obrigatório.' }, { status: 400 });
    }

    const service = new CustomerAudienceService();
    const result = await service.syncCustomersToMetaAudience(empresaId);

    return NextResponse.json({
      success: true,
      mensagem: 'Públicos personalizados criados e sincronizados com sucesso na Meta.',
      detalhes: result
    });
  } catch (error: any) {
    console.error('Erro ao sincronizar públicos de clientes:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Erro ao sincronizar públicos.' },
      { status: 500 }
    );
  }
}
