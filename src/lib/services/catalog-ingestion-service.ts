/**
 * Plataforma de Gestão de Tráfego com IA
 * Serviço de Ingestão, Parser e Cache do Catálogo XML da Prefiro Delivery
 * (PDF Seções 28, 29, 30, 31)
 */

import { db } from '../db';
import { getPrefiroDeliveryService } from '../adapters';

export interface ParsedProduct {
  id: string;
  nome: string;
  descricao?: string;
  preco: number;
  preco_promocional?: number;
  disponibilidade: boolean;
  categoria?: string;
  url?: string;
  imagem?: string;
  marca?: string;
  estabelecimento?: string;
  status: string;
}

export interface IngestionResult {
  success: boolean;
  total: number;
  novos: number;
  alterados: number;
  removidos: number;
  com_erro: number;
  erros: string[];
  last_sync_at: Date;
}

export class CatalogIngestionService {
  /**
   * Parser XML manual/resiliente para extrair tags sem dependência de libs pesadas C++ nativas.
   */
  public parseProductsXml(xml: string): ParsedProduct[] {
    const products: ParsedProduct[] = [];
    const productRegex = /<produto>([\s\S]*?)<\/produto>/gi;
    let match: RegExpExecArray | null;

    while ((match = productRegex.exec(xml)) !== null) {
      const block = match[1];
      const getTag = (tag: string): string | undefined => {
        const tagRegex = new RegExp(`<${tag}>([\\s\\S]*?)<\\/${tag}>`, 'i');
        const m = tagRegex.exec(block);
        return m ? m[1].trim() : undefined;
      };

      const id = getTag('id');
      const nome = getTag('nome');
      const precoRaw = getTag('preco');
      const precoPromoRaw = getTag('preco_promocional');
      const dispRaw = getTag('disponibilidade');

      if (!id || !nome || !precoRaw) {
        // Marcado como incompleto / inválido
        continue;
      }

      products.push({
        id,
        nome,
        descricao: getTag('descricao'),
        preco: parseFloat(precoRaw) || 0,
        preco_promocional: precoPromoRaw ? parseFloat(precoPromoRaw) : undefined,
        disponibilidade: dispRaw ? dispRaw.toLowerCase() === 'true' : true,
        categoria: getTag('categoria'),
        url: getTag('url'),
        imagem: getTag('imagem'),
        marca: getTag('marca'),
        estabelecimento: getTag('estabelecimento'),
        status: getTag('status') || 'ATIVO',
      });
    }

    return products;
  }

  /**
   * Sincroniza o catálogo a partir do slug da Prefiro Delivery registrado na Empresa
   */
  public async syncFromPrefiro(empresaId: string): Promise<IngestionResult> {
    const empresa = await db.empresa.findUnique({
      where: { id: empresaId }
    });

    if (!empresa) {
      throw new Error(`Empresa ${empresaId} não encontrada.`);
    }

    const slug = empresa.slug_prefiro || 'bella-napoli';
    const prefiroService = getPrefiroDeliveryService();
    const xml = await prefiroService.getProductsXml(slug);

    return this.ingestXmlString(empresaId, xml);
  }

  /**
   * Processa a string XML executando os 10 passos da Seção 30 do PDF
   */
  public async ingestXmlString(empresaId: string, xml: string): Promise<IngestionResult> {
    const now = new Date();

    const empresa = await db.empresa.findUnique({ where: { id: empresaId } });
    if (!empresa) {
      return {
        success: false,
        total: 0,
        novos: 0,
        alterados: 0,
        removidos: 0,
        com_erro: 1,
        erros: [`Empresa ${empresaId} não encontrada.`],
        last_sync_at: now
      };
    }

    const erros: string[] = [];
    let novos = 0;
    let alterados = 0;
    let removidos = 0;
    let comErro = 0;

    // 1. Validar e parsear blocos de produtos
    const rawBlocksRegex = /<produto>([\s\S]*?)<\/produto>/gi;
    let blockMatch: RegExpExecArray | null;
    const parsedList: ParsedProduct[] = [];

    while ((blockMatch = rawBlocksRegex.exec(xml)) !== null) {
      const block = blockMatch[1];
      const getTag = (tag: string): string | undefined => {
        const tagRegex = new RegExp(`<${tag}>([\\s\\S]*?)<\\/${tag}>`, 'i');
        const m = tagRegex.exec(block);
        return m ? m[1].trim() : undefined;
      };

      const id = getTag('id');
      const nome = getTag('nome');
      const precoRaw = getTag('preco');

      if (!id || id.trim() === '') {
        comErro++;
        erros.push(`Produto descartado: ID é obrigatório. Conteúdo: ${block.substring(0, 40)}...`);
        continue;
      }

      parsedList.push({
        id,
        nome: nome || 'Produto Sem Nome',
        descricao: getTag('descricao'),
        preco: precoRaw ? parseFloat(precoRaw) || 0 : 0,
        preco_promocional: getTag('preco_promocional') ? parseFloat(getTag('preco_promocional')!) : undefined,
        disponibilidade: getTag('disponibilidade') ? getTag('disponibilidade')!.toLowerCase() === 'true' : true,
        categoria: getTag('categoria'),
        url: getTag('url'),
        imagem: getTag('imagem'),
        marca: getTag('marca'),
        estabelecimento: getTag('estabelecimento'),
        status: getTag('status') || 'ATIVO'
      });
    }

    // 2. Obter ou criar registro do MetaCatalogo
    let catalogo = await db.metaCatalogo.findFirst({
      where: { empresa_id: empresaId }
    });

    if (!catalogo) {
      catalogo = await db.metaCatalogo.create({
        data: {
          empresa_id: empresaId,
          meta_catalog_id: `cat_${empresaId}`,
          name: 'Catálogo Prefiro Delivery',
          feed_url: `http://prefirodelivery.com/${empresaId}/get-products`,
          status: 'SINCRONIZADO'
        }
      });
    }

    // 3. Buscar produtos já existentes no banco para diff
    const existingProducts = await db.metaProduto.findMany({
      where: { empresa_id: empresaId }
    });
    const existingMap = new Map(existingProducts.map(p => [p.external_id, p]));
    const currentIncomingIds = new Set(parsedList.map(p => p.id));

    // 4. Processar novos e alterados
    for (const item of parsedList) {
      const existing = existingMap.get(item.id);

      if (!existing) {
        // Novo produto
        await db.metaProduto.create({
          data: {
            empresa_id: empresaId,
            catalogo_id: catalogo.id,
            external_id: item.id,
            nome: item.nome,
            descricao: item.descricao,
            preco: item.preco,
            preco_promocional: item.preco_promocional,
            disponibilidade: item.disponibilidade,
            categoria: item.categoria,
            url_produto: item.url,
            url_imagem: item.imagem,
            marca: item.marca,
            status: item.status
          }
        });
        novos++;
      } else {
        // Verificar se houve alteração
        const changed =
          existing.nome !== item.nome ||
          existing.preco !== item.preco ||
          existing.preco_promocional !== (item.preco_promocional ?? null) ||
          existing.disponibilidade !== item.disponibilidade ||
          existing.status !== item.status;

        if (changed) {
          await db.metaProduto.update({
            where: { id: existing.id },
            data: {
              nome: item.nome,
              descricao: item.descricao,
              preco: item.preco,
              preco_promocional: item.preco_promocional,
              disponibilidade: item.disponibilidade,
              categoria: item.categoria,
              url_produto: item.url,
              url_imagem: item.imagem,
              marca: item.marca,
              status: item.status
            }
          });
          alterados++;
        }
      }
    }

    // 5. Detectar removidos (presentes no banco mas ausentes no XML)
    for (const [extId, prod] of Array.from(existingMap.entries())) {
      if (!currentIncomingIds.has(extId) && prod.status !== 'INATIVO') {
        await db.metaProduto.update({
          where: { id: prod.id },
          data: { status: 'INATIVO', disponibilidade: false }
        });
        removidos++;
      }
    }

    // 6. Atualizar estatísticas no MetaCatalogo
    const totalCount = await db.metaProduto.count({ where: { empresa_id: empresaId, status: 'ATIVO' } });

    await db.metaCatalogo.updateMany({
      where: { id: catalogo.id },
      data: {
        total_products: totalCount,
        active_products: totalCount,
        error_products: comErro,
        last_sync_at: now,
        next_sync_at: new Date(now.getTime() + 60 * 60 * 1000), // +1 hora (Seção 29)
        status: comErro > 0 ? 'ALERTA' : 'SINCRONIZADO'
      }
    });

    return {
      success: true,
      total: parsedList.length,
      novos,
      alterados,
      removidos,
      com_erro: comErro,
      erros,
      last_sync_at: now
    };
  }
}
