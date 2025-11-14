# Guia de Uso do Swagger UI - Suavitrine API

## 📚 Acessando a Documentação

Após iniciar a aplicação, você pode acessar a documentação interativa da API através dos seguintes URLs:

### Swagger UI (Interface Interativa)
```
http://localhost:8080/swagger-ui.html
```

### OpenAPI JSON
```
http://localhost:8080/v3/api-docs
```

## 🔐 Autenticação

A API utiliza autenticação JWT (Bearer Token). Para testar os endpoints protegidos:

### 1. Registrar um novo usuário
- Acesse o endpoint `POST /api/v1/auth/register`
- Clique em "Try it out"
- Preencha o corpo da requisição:
```json
{
  "name": "Seu Nome",
  "email": "seu.email@example.com",
  "password": "suaSenha123"
}
```
- Execute e copie o `token` da resposta

### 2. Fazer Login
- Acesse o endpoint `POST /api/v1/auth/login`
- Clique em "Try it out"
- Preencha o corpo da requisição:
```json
{
  "email": "seu.email@example.com",
  "password": "suaSenha123"
}
```
- Execute e copie o `token` da resposta

### 3. Configurar o Token no Swagger
- No topo da página do Swagger UI, clique no botão **"Authorize"** 🔓
- Cole o token JWT obtido no campo `Value`
- Clique em **"Authorize"**
- Clique em **"Close"**

Agora você pode testar todos os endpoints protegidos!

## 📋 Estrutura da API

### Autenticação
- `POST /api/v1/auth/register` - Registrar novo usuário
- `POST /api/v1/auth/login` - Login de usuário

### Lojas
- `POST /api/v1/stores` - Criar nova loja
- `PUT /api/v1/stores/{storeId}` - Atualizar loja
- `GET /api/v1/stores/{storeId}` - Buscar loja
- `GET /api/v1/stores/user/{userId}` - Listar lojas do usuário
- `POST /api/v1/stores/{storeId}/users` - Adicionar usuário à loja
- `DELETE /api/v1/stores/{storeId}/users/{userId}` - Remover usuário da loja
- `GET /api/v1/stores/{storeId}/users` - Listar usuários da loja

### Categorias
- `POST /api/v1/categories` - Criar categoria
- `PUT /api/v1/categories/{categoryId}` - Atualizar categoria
- `GET /api/v1/categories/{categoryId}` - Buscar categoria
- `GET /api/v1/categories/store/{storeId}` - Listar categorias da loja
- `DELETE /api/v1/categories/{categoryId}` - Deletar categoria

### Produtos
- `POST /api/v1/products` - Criar produto
- `PUT /api/v1/products/{productId}` - Atualizar produto
- `GET /api/v1/products/{productId}` - Buscar produto
- `GET /api/v1/products/store/{storeId}` - Listar produtos da loja
- `GET /api/v1/products/category/{categoryId}` - Listar produtos da categoria
- `DELETE /api/v1/products/{productId}` - Deletar produto

## 🔑 Permissões

### OWNER (Proprietário)
- Todas as permissões da loja
- Pode adicionar/remover usuários
- Pode criar/editar/deletar produtos e categorias

### MANAGER (Gerente)
- Pode criar/editar/deletar produtos e categorias
- Pode adicionar/remover usuários

### EMPLOYEE (Funcionário)
- Apenas leitura dos dados da loja

## 💡 Dicas de Uso

1. **Ordenação**: Os endpoints são ordenados alfabeticamente por tag e método HTTP
2. **Try it out**: Clique neste botão para testar um endpoint interativamente
3. **Schemas**: Role até o final da página para ver os modelos de dados (DTOs)
4. **Responses**: Cada endpoint mostra os possíveis códigos de resposta HTTP
5. **Examples**: O Swagger gera exemplos automáticos baseados nos schemas

## 🚀 Exemplo de Fluxo Completo

1. **Registrar usuário** → `/api/v1/auth/register`
2. **Fazer login** → `/api/v1/auth/login` (copie o token)
3. **Autorizar no Swagger** → Clique em "Authorize" e cole o token
4. **Criar loja** → `/api/v1/stores` (você será o OWNER)
5. **Criar categoria** → `/api/v1/categories`
6. **Criar produto** → `/api/v1/products`
7. **Listar produtos** → `/api/v1/products/store/{storeId}`

## 📝 Notas Importantes

- O preço dos produtos é armazenado em **centavos** (ex: R$ 10,50 = 1050)
- Todas as deleções são **soft delete** (registro não é removido, apenas marcado como deletado)
- UUIDs são gerados automaticamente para todos os recursos
- Timestamps (`createdAt`, `updatedAt`) são gerenciados automaticamente

## 🛠️ Configurações

As configurações do Swagger podem ser ajustadas em `application.properties`:

```properties
springdoc.api-docs.path=/v3/api-docs
springdoc.swagger-ui.path=/swagger-ui.html
springdoc.swagger-ui.operationsSorter=method
springdoc.swagger-ui.tagsSorter=alpha
springdoc.swagger-ui.tryItOutEnabled=true
```

---

**Desenvolvido com ❤️ pela equipe Suavitrine**

