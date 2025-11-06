# Guia do Global Exception Handler - Suavitrine API

## 📋 Visão Geral

O projeto utiliza um sistema centralizado de tratamento de exceções através do `@RestControllerAdvice`, garantindo respostas de erro padronizadas e consistentes em toda a API.

## 🏗️ Arquitetura

### 1. DTO de Resposta de Erro

```java
ErrorResponse {
    Instant timestamp,      // Momento do erro
    int status,            // Código HTTP (400, 404, 403, etc)
    String error,          // Descrição do status
    String message,        // Mensagem descritiva do erro
    String path,           // URL do endpoint
    List<ValidationError> validationErrors  // Erros de validação (opcional)
}
```

### 2. Exceções Customizadas

#### `ObjectNotFoundException` (404 - Not Found)
Lançada quando um recurso solicitado não existe no banco de dados.

**Exemplo de uso:**
```java
Store store = storeRepository.findById(storeId)
    .orElseThrow(() -> new ObjectNotFoundException("Loja não encontrada"));
```

**Resposta:**
```json
{
  "timestamp": "2024-01-20T10:30:00Z",
  "status": 404,
  "error": "Not Found",
  "message": "Loja não encontrada",
  "path": "/api/v1/stores/123e4567-e89b-12d3-a456-426614174000"
}
```

#### `InsufficientPermissionException` (403 - Forbidden)
Lançada quando o usuário não tem permissão para realizar a operação.

**Exemplo de uso:**
```java
if (!userHasPermissionToEditStore(store)) {
    throw new InsufficientPermissionException("Usuário não tem permissão para criar produtos nesta loja.");
}
```

**Resposta:**
```json
{
  "timestamp": "2024-01-20T10:30:00Z",
  "status": 403,
  "error": "Forbidden",
  "message": "Usuário não tem permissão para criar produtos nesta loja.",
  "path": "/api/v1/products"
}
```

#### `IllegalUserArgumentException` (400 - Bad Request)
Lançada quando os dados fornecidos são inválidos ou violam regras de negócio.

**Exemplo de uso:**
```java
if (store.getDeletedAt() != null) {
    throw new IllegalUserArgumentException("Loja foi deletada");
}
```

**Resposta:**
```json
{
  "timestamp": "2024-01-20T10:30:00Z",
  "status": 400,
  "error": "Bad Request",
  "message": "Loja foi deletada",
  "path": "/api/v1/stores/123e4567-e89b-12d3-a456-426614174000"
}
```

### 3. Exceções do Spring Tratadas

#### Validação de Bean (`@Valid`)
Captura erros de validação dos DTOs com anotações como `@NotNull`, `@Email`, etc.

**Resposta:**
```json
{
  "timestamp": "2024-01-20T10:30:00Z",
  "status": 400,
  "error": "Bad Request",
  "message": "Erro de validação nos campos da requisição",
  "path": "/api/v1/products",
  "validationErrors": [
    {
      "field": "title",
      "rejectedValue": "",
      "message": "Título não pode ser vazio"
    },
    {
      "field": "price",
      "rejectedValue": null,
      "message": "Preço é obrigatório"
    }
  ]
}
```

#### Autenticação Inválida (401 - Unauthorized)
Captura erros de autenticação como credenciais inválidas ou token expirado.

**Resposta:**
```json
{
  "timestamp": "2024-01-20T10:30:00Z",
  "status": 401,
  "error": "Unauthorized",
  "message": "Credenciais inválidas ou token expirado",
  "path": "/api/v1/products"
}
```

#### JSON Malformado
Captura erros de parsing JSON.

**Resposta:**
```json
{
  "timestamp": "2024-01-20T10:30:00Z",
  "status": 400,
  "error": "Bad Request",
  "message": "JSON malformado ou inválido: Unexpected character...",
  "path": "/api/v1/products"
}
```

#### Tipo de Parâmetro Incorreto
Captura erros quando o tipo de um parâmetro está incorreto (ex: UUID inválido).

**Resposta:**
```json
{
  "timestamp": "2024-01-20T10:30:00Z",
  "status": 400,
  "error": "Bad Request",
  "message": "Parâmetro 'productId' com valor 'abc123' não pôde ser convertido para o tipo UUID",
  "path": "/api/v1/products/abc123"
}
```

## 🎯 Boas Práticas

### 1. Quando Usar Cada Exception

| Situação | Exception |
|----------|-----------|
| Recurso não encontrado no banco | `ObjectNotFoundException` |
| Usuário sem permissão | `InsufficientPermissionException` |
| Dados inválidos ou regra de negócio violada | `IllegalUserArgumentException` |
| Validação de campos de entrada | Bean Validation (`@Valid`) |

### 2. Mensagens de Erro Claras

❌ **Ruim:**
```java
throw new ObjectNotFoundException("Error");
```

✅ **Bom:**
```java
throw new ObjectNotFoundException("Produto não encontrado");
```

✅ **Melhor ainda:**
```java
throw new ObjectNotFoundException("Produto com ID " + productId + " não encontrado");
```

### 3. Não Expor Detalhes Internos

❌ **Evite:**
```java
throw new RuntimeException("NullPointerException at line 42: user.getStore().getId()");
```

✅ **Prefira:**
```java
throw new IllegalUserArgumentException("Loja do usuário não está definida");
```

## 🔧 Personalização

### Adicionar Nova Exception Customizada

1. **Criar a classe de exception:**
```java
@ResponseStatus(HttpStatus.CONFLICT)
public class DuplicateResourceException extends RuntimeException {
    public DuplicateResourceException(String message) {
        super(message);
    }
}
```

2. **Adicionar handler no GlobalExceptionHandler:**
```java
@ExceptionHandler(DuplicateResourceException.class)
public ResponseEntity<ErrorResponse> handleDuplicateResourceException(
        DuplicateResourceException ex,
        HttpServletRequest request
) {
    ErrorResponse error = new ErrorResponse(
            Instant.now(),
            HttpStatus.CONFLICT.value(),
            HttpStatus.CONFLICT.getReasonPhrase(),
            ex.getMessage(),
            request.getRequestURI()
    );
    return ResponseEntity.status(HttpStatus.CONFLICT).body(error);
}
```

3. **Usar nos services:**
```java
if (productRepository.existsByTitleAndStore(title, store)) {
    throw new DuplicateResourceException("Já existe um produto com este título nesta loja");
}
```

## 🧪 Testando no Swagger

1. Acesse o Swagger UI em `http://localhost:8080/swagger-ui.html`
2. Teste os endpoints sem autenticação → **401 Unauthorized**
3. Tente buscar um recurso inexistente → **404 Not Found**
4. Envie dados inválidos → **400 Bad Request** com detalhes de validação
5. Tente uma operação sem permissão → **403 Forbidden**

## 📊 Códigos HTTP Utilizados

| Código | Status | Quando Usar |
|--------|--------|-------------|
| 400 | Bad Request | Dados inválidos ou regra de negócio violada |
| 401 | Unauthorized | Não autenticado ou token inválido |
| 403 | Forbidden | Autenticado mas sem permissão |
| 404 | Not Found | Recurso não encontrado |
| 500 | Internal Server Error | Erro inesperado no servidor |

## 💡 Exemplo Completo

```java
@Service
@RequiredArgsConstructor
public class ProductService {

    private final ProductRepository productRepository;
    private final StoreRepository storeRepository;
    
    public Product createProduct(Product product, UUID storeId) {
        // 404 - Not Found
        Store store = storeRepository.findById(storeId)
            .orElseThrow(() -> new ObjectNotFoundException("Loja não encontrada"));
        
        // 400 - Bad Request
        if (store.getDeletedAt() != null) {
            throw new IllegalUserArgumentException("Não é possível criar produto em loja deletada");
        }
        
        // 403 - Forbidden
        if (!userHasPermission(store)) {
            throw new InsufficientPermissionException("Usuário não tem permissão para criar produtos nesta loja");
        }
        
        product.setStore(store);
        return productRepository.save(product);
    }
}
```

---

**Desenvolvido com ❤️ pela equipe Suavitrine**

