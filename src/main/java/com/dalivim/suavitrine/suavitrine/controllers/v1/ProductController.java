package com.dalivim.suavitrine.suavitrine.controllers.v1;

import com.dalivim.suavitrine.suavitrine.dtos.CreateProductRequest;
import com.dalivim.suavitrine.suavitrine.dtos.ProductResponse;
import com.dalivim.suavitrine.suavitrine.dtos.UpdateProductRequest;
import com.dalivim.suavitrine.suavitrine.services.ProductService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/products")
@RequiredArgsConstructor
@Tag(name = "Produtos", description = "Gerenciamento de produtos e suas variações")
@SecurityRequirement(name = "bearerAuth")
public class ProductController {

    private final ProductService productService;

    /**
     * Cria um novo produto
     */
    @PostMapping
    @Operation(summary = "Criar produto", description = "Cria um novo produto com suas variações (apenas OWNER e MANAGER)")
    public ResponseEntity<ProductResponse> createProduct(
            @RequestBody CreateProductRequest request
    ) {
        ProductResponse response = productService.createProduct(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    /**
     * Atualiza um produto existente
     */
    @PutMapping("/{productId}")
    @Operation(summary = "Atualizar produto", description = "Atualiza um produto existente e suas variações (apenas OWNER e MANAGER)")
    public ResponseEntity<ProductResponse> updateProduct(
            @PathVariable UUID productId,
            @RequestBody UpdateProductRequest request
    ) {
        ProductResponse response = productService.updateProduct(productId, request);
        return ResponseEntity.ok(response);
    }

    /**
     * Busca um produto por ID
     */
    @GetMapping("/{productId}")
    @Operation(summary = "Buscar produto", description = "Retorna os detalhes de um produto específico")
    public ResponseEntity<ProductResponse> getProduct(@PathVariable UUID productId) {
        ProductResponse response = productService.getProductById(productId);
        return ResponseEntity.ok(response);
    }

    /**
     * Busca todos os produtos de uma loja
     */
    @GetMapping("/store/{storeId}")
    @Operation(summary = "Listar produtos da loja", description = "Retorna todos os produtos de uma loja específica")
    public ResponseEntity<List<ProductResponse>> getProductsByStore(@PathVariable UUID storeId) {
        List<ProductResponse> response = productService.getProductsByStore(storeId);
        return ResponseEntity.ok(response);
    }

    /**
     * Busca todos os produtos de uma categoria
     */
    @GetMapping("/category/{categoryId}")
    @Operation(summary = "Listar produtos da categoria", description = "Retorna todos os produtos de uma categoria específica")
    public ResponseEntity<List<ProductResponse>> getProductsByCategory(@PathVariable UUID categoryId) {
        List<ProductResponse> response = productService.getProductsByCategory(categoryId);
        return ResponseEntity.ok(response);
    }

    /**
     * Remove um produto (soft delete)
     */
    @DeleteMapping("/{productId}")
    @Operation(summary = "Deletar produto", description = "Remove um produto (soft delete) (apenas OWNER e MANAGER)")
    public ResponseEntity<Void> deleteProduct(@PathVariable UUID productId) {
        productService.deleteProduct(productId);
        return ResponseEntity.noContent().build();
    }

    /**
     * Atualiza a ordem dos produtos de uma categoria
     */
    @PutMapping("/category/{categoryId}/order")
    @Operation(summary = "Atualizar ordem dos produtos", description = "Atualiza a ordem de exibição dos produtos de uma categoria (apenas OWNER e MANAGER)")
    public ResponseEntity<Void> updateProductsOrder(
            @PathVariable UUID categoryId,
            @RequestBody List<UUID> productIds
    ) {
        productService.updateProductsOrder(categoryId, productIds);
        return ResponseEntity.ok().build();
    }

    /**
     * Alterna a disponibilidade de um produto
     */
    @PatchMapping("/{productId}/toggle-availability")
    @Operation(summary = "Alternar disponibilidade", description = "Alterna a disponibilidade de um produto (apenas OWNER e MANAGER)")
    public ResponseEntity<ProductResponse> toggleAvailability(@PathVariable UUID productId) {
        ProductResponse response = productService.toggleAvailability(productId);
        return ResponseEntity.ok(response);
    }
}

