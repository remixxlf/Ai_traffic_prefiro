import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  try {
    const empresas = await db.empresa.findMany({
      orderBy: { created_at: 'desc' },
      select: {
        id: true,
        nome: true,
        segmento: true,
        cidade: true,
        estado: true,
        slug_prefiro: true,
        modo_operacao: true,
        _count: {
          select: {
            campanhas: true,
            meta_produtos: true,
            criativos: true,
            aprovacoes: true,
          }
        }
      }
    });

    return NextResponse.json({ success: true, empresas });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
