# Modelo de Atribuição — ROAS Real e Receita Real (Prefiro Delivery + Meta Ads)

- **Referência do Projeto**: PDF Seções 52, 53 e 73
- **Data**: 2026-09-14
- **Objetivo**: Documentar formalmente as regras de atribuição e conciliação entre conversões reportadas pelo algoritmo da Meta e pedidos efetivamente pagos na Prefiro Delivery.

---

## 1. Contexto do Problema
O Gerenciador de Anúncios da Meta utiliza janelas de atribuição estatísticas (geralmente 7 dias após clique ou 1 dia após visualização), frequentemente superestimando ou subestimando conversões reais:
- **Sobre-atribuição Meta**: Usuários que já iriam pedir no restaurante clicam no anúncio apenas para acessar o cardápio.
- **Sub-atribuição Meta**: Clientes impactados pelo anúncio que finalizam o pedido pelo WhatsApp, telefone ou diretamente no site em outro navegador/dispositivo sem Pixel associado.

---

## 2. Metodologia do ROAS Real

A plataforma calcula métricas proprietárias baseadas no banco de dados operacional da Prefiro Delivery:

### Fórmulas Matemáticas:

1. **Receita Real Atribuível**:
   $$\text{Receita Real} = \sum_{\text{pedidos pagos}} \text{Valor Total do Pedido}$$

2. **ROAS Real**:
   $$\text{ROAS Real} = \frac{\text{Receita Real}}{\text{Investimento Total}}$$

3. **Custo Real por Pedido**:
   $$\text{Custo Real por Pedido} = \frac{\text{Investimento Total}}{\text{Pedidos Reais Faturados}}$$

---

## 3. Modelo de Distribuição por Campanha

Quando a empresa possui múltiplas campanhas ativas simultâneas:
1. **Atribuição Direta via UTM / Link**: Quando o pedido na Prefiro Delivery contém parâmetros `utm_campaign`, a receita é alocada integralmente à campanha correspondente.
2. **Atribuição Ponderada por Investimento (Fallback)**: Na ausência de tag UTM direta, a receita real consolidada do dia é distribuída proporcionalmente ao investimento (`spend`) de cada campanha ativa:
   $$\text{Peso}_i = \frac{\text{Investimento}_i}{\sum \text{Investimento}}$$
   $$\text{Receita Real}_i = \text{Receita Real Total} \times \text{Peso}_i$$

---

## 4. Auditoria e Idempotência
Todos os snapshots consolidados são armazenados diariamente na tabela `campanha_metrica` do banco interno, permitindo que a IA e os relatórios comparem a evolução temporal do ROAS Meta versus ROAS Real.
