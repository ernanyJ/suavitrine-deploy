package com.dalivim.suavitrine.suavitrine.controllers.v1;

import com.dalivim.suavitrine.suavitrine.dtos.CategoryResponse;
import com.dalivim.suavitrine.suavitrine.dtos.CreateCategoryRequest;
import com.dalivim.suavitrine.suavitrine.dtos.UpdateCategoryRequest;
import com.dalivim.suavitrine.suavitrine.services.CategoryService;
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
@RequestMapping("/api/v1/categories")
@RequiredArgsConstructor
@Tag(name = "Categorias", description = "Gerenciamento de categorias de produtos")
@SecurityRequirement(name = "bearerAuth")
public class CategoryController {

    private final CategoryService categoryService;

    /**
     * Cria uma nova categoria
     */
    @PostMapping
    @Operation(summary = "Criar categoria", description = "Cria uma nova categoria de produtos (apenas OWNER e MANAGER)")
    public ResponseEntity<CategoryResponse> createCategory(
            @RequestBody CreateCategoryRequest request
    ) {
        CategoryResponse response = categoryService.createCategory(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    /**
     * Atualiza uma categoria existente
     */
    @PutMapping("/{categoryId}")
    @Operation(summary = "Atualizar categoria", description = "Atualiza uma categoria existente (apenas OWNER e MANAGER)")
    public ResponseEntity<CategoryResponse> updateCategory(
            @PathVariable UUID categoryId,
            @RequestBody UpdateCategoryRequest request
    ) {
        CategoryResponse response = categoryService.updateCategory(categoryId, request);
        return ResponseEntity.ok(response);
    }

    /**
     * Busca uma categoria por ID
     */
    @GetMapping("/{categoryId}")
    @Operation(summary = "Buscar categoria", description = "Retorna os detalhes de uma categoria específica")
    public ResponseEntity<CategoryResponse> getCategory(@PathVariable UUID categoryId) {
        CategoryResponse response = categoryService.getCategoryById(categoryId);
        return ResponseEntity.ok(response);
    }

    /**
     * Busca todas as categorias de uma loja
     */
    @GetMapping("/store/{storeId}")
    @Operation(summary = "Listar categorias da loja", description = "Retorna todas as categorias de uma loja específica")
    public ResponseEntity<List<CategoryResponse>> getCategoriesByStore(@PathVariable UUID storeId) {
        List<CategoryResponse> response = categoryService.getCategoriesByStore(storeId);
        return ResponseEntity.ok(response);
    }

    /**
     * Remove uma categoria (soft delete)
     */
    @DeleteMapping("/{categoryId}")
    @Operation(summary = "Deletar categoria", description = "Remove uma categoria (soft delete) (apenas OWNER e MANAGER)")
    public ResponseEntity<Void> deleteCategory(@PathVariable UUID categoryId) {
        categoryService.deleteCategory(categoryId);
        return ResponseEntity.noContent().build();
    }
}

