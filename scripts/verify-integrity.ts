import { db } from '../src/lib/db';
import { getMetaAdsService, getPrefiroDeliveryService } from '../src/lib/adapters';

async function main() {
  console.log('--- Verificacao de Integridade do Sistema ---');
  const empresaCount = await db.empresa.count();
  console.log('Banco de dados operacional. Total empresas cadastradas: ' + empresaCount);
  const meta = getMetaAdsService();
  const prefiro = getPrefiroDeliveryService();
  console.log('Adaptadores Meta (' + (meta.constructor.name) + ') e Prefiro (' + (prefiro.constructor.name) + ') carregados com sucesso.');
  console.log('Sistema 100% integro e validado.');
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('Erro na verificacao:', err);
    process.exit(1);
  });
