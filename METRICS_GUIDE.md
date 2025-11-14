# Sistema de Métricas - Sua Vitrine

## Visão Geral

O sistema de métricas foi implementado para fornecer insights sobre o desempenho das lojas, incluindo:

- **Acessos por dia** nos últimos 30 dias
- **Produtos com mais cliques**
- **Produtos que mais são convertidos**
- **Categorias com produtos mais clicados**
- **Categorias mais clicadas**

## Arquitetura

### Entidades

1. **StoreEvent**: Armazena eventos individuais
   - Tipos: `STORE_ACCESS`, `PRODUCT_CLICK`, `PRODUCT_CONVERSION`, `CATEGORY_CLICK`, `CATEGORY_ACCESS`
   - Entidades relacionadas: `STORE`, `PRODUCT`, `CATEGORY`

2. **StoreMetrics**: Armazena métricas agregadas por dia
   - Contadores diários para cada tipo de evento
   - Top produtos e categorias do dia (em JSON)

### Índices Otimizados

- `idx_store_events_store_id`: Busca por loja
- `idx_store_events_event_type`: Busca por tipo de evento
- `idx_store_events_created_at`: Busca por data
- `idx_store_events_store_type_date`: Busca composta otimizada
- `idx_store_metrics_store_date`: Busca de métricas por loja e data

## Endpoints da API

### 1. Registrar Eventos

#### Evento Genérico
```http
POST /api/v1/metrics/events
Content-Type: application/json
Authorization: Bearer <token>

{
  "eventType": "PRODUCT_CLICK",
  "entityId": "uuid-do-produto",
  "entityType": "PRODUCT",
  "metadata": "{\"userAgent\":\"Mozilla/5.0...\"}"
}
```

#### Acesso à Loja
```http
POST /api/v1/metrics/events/store-access
Authorization: Bearer <token>
```

#### Clique em Produto
```http
POST /api/v1/metrics/events/product-click/{productId}
Authorization: Bearer <token>
```

#### Conversão de Produto
```http
POST /api/v1/metrics/events/product-conversion/{productId}
Content-Type: application/json
Authorization: Bearer <token>

{
  "type": "whatsapp_contact",
  "phone": "+5511999999999"
}
```

#### Clique em Categoria
```http
POST /api/v1/metrics/events/category-click/{categoryId}
Authorization: Bearer <token>
```

#### Acesso à Categoria
```http
POST /api/v1/metrics/events/category-access/{categoryId}
Authorization: Bearer <token>
```

### 2. Consultar Métricas

#### Métricas Gerais
```http
GET /api/v1/metrics/store/{storeId}?days=30
Authorization: Bearer <token>
```

#### Métricas Diárias (últimos 30 dias)
```http
GET /api/v1/metrics/store/{storeId}/daily
Authorization: Bearer <token>
```

### Resposta das Métricas

```json
{
  "storeId": "uuid-da-loja",
  "storeName": "Nome da Loja",
  "startDate": "2024-01-01T00:00:00Z",
  "endDate": "2024-01-30T23:59:59Z",
  "totalAccesses": 1250,
  "totalProductClicks": 850,
  "totalProductConversions": 45,
  "totalCategoryClicks": 320,
  "totalCategoryAccesses": 180,
  "dailyMetrics": [
    {
      "date": "2024-01-01T00:00:00Z",
      "accesses": 42,
      "productClicks": 28,
      "productConversions": 2,
      "categoryClicks": 12,
      "categoryAccesses": 8
    }
  ],
  "topProductsByClicks": [
    {
      "productId": "uuid-produto",
      "productTitle": "Nome do Produto",
      "clicks": 45,
      "conversions": 3,
      "conversionRate": 6.67
    }
  ],
  "topProductsByConversions": [...],
  "topCategoriesByClicks": [...],
  "topCategoriesByAccesses": [...]
}
```

## Implementação no Frontend

### Exemplo de Integração

```javascript
// Registrar clique em produto
const trackProductClick = async (productId) => {
  try {
    await fetch(`/api/v1/metrics/events/product-click/${productId}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
  } catch (error) {
    console.error('Erro ao registrar clique:', error);
  }
};

// Registrar conversão
const trackProductConversion = async (productId, conversionData) => {
  try {
    await fetch(`/api/v1/metrics/events/product-conversion/${productId}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(conversionData)
    });
  } catch (error) {
    console.error('Erro ao registrar conversão:', error);
  }
};

// Obter métricas
const getStoreMetrics = async (storeId, days = 30) => {
  try {
    const response = await fetch(`/api/v1/metrics/store/${storeId}?days=${days}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    return await response.json();
  } catch (error) {
    console.error('Erro ao obter métricas:', error);
  }
};
```

## Considerações de Performance

### Otimizações Implementadas

1. **Índices Compostos**: Consultas otimizadas para buscas frequentes
2. **Agregação Diária**: Métricas calculadas uma vez por dia
3. **Lazy Loading**: Relacionamentos carregados sob demanda
4. **Transações**: Operações atômicas para consistência

### Recomendações

1. **Processamento Assíncrono**: Para produção, considere usar `@Async` para processar métricas
2. **Cache**: Implemente cache Redis para consultas frequentes
3. **Limpeza**: Configure job para limpar eventos antigos (> 1 ano)
4. **Monitoramento**: Monitore performance das consultas

## Migração do Banco

A migration `V16__create_metrics_tables.sql` cria:

- Tabela `store_events` com índices otimizados
- Tabela `store_metrics` com índices otimizados
- Relacionamentos com `store` via foreign keys
- Índices únicos para evitar duplicatas

## Segurança

- Todos os endpoints requerem autenticação JWT
- Usuários só podem acessar métricas de suas próprias lojas
- Validação de permissões através do `StoreService`

## Monitoramento

### Logs Importantes

- Criação de eventos: `Creating event for store {}: {}`
- Atualização de métricas: `Updating daily metrics for store {} on date {}`
- Consulta de métricas: `Getting metrics for store {} for last {} days`

### Métricas de Sistema

- Tempo de resposta dos endpoints
- Volume de eventos por dia
- Performance das consultas agregadas
