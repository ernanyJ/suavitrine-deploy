package com.dalivim.suavitrine.suavitrine.controllers.v1;

import com.dalivim.suavitrine.suavitrine.dtos.*;
import com.dalivim.suavitrine.suavitrine.infra.security.JwtService;
import com.dalivim.suavitrine.suavitrine.services.StoreService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/stores")
@RequiredArgsConstructor
@Tag(name = "Lojas", description = "Gerenciamento de lojas e seus usuários")
public class StoreController {

    private final StoreService storeService;
    private final JwtService jwtService;

    /**
     * Cria uma nova loja
     * O usuário autenticado será automaticamente o OWNER
     */
    @PostMapping
    @Operation(summary = "Criar nova loja", description = "Cria uma nova loja e define o usuário autenticado como proprietário (OWNER)")
    @SecurityRequirement(name = "bearerAuth")
    public ResponseEntity<StoreResponse> createStore(
            @RequestBody @Valid CreateStoreRequest request
    ) {
        var userId = jwtService.getCurrentAuthenticatedUser().getId();
        StoreResponse response = storeService.createStore(request, userId);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    /**
     * Atualiza uma loja existente
     */
    @PutMapping("/{storeId}")
    @Operation(summary = "Atualizar loja", description = "Atualiza os dados de uma loja existente (apenas OWNER e MANAGER)")
    @SecurityRequirement(name = "bearerAuth")
    public ResponseEntity<StoreResponse> updateStore(
            @PathVariable UUID storeId,
            @RequestBody UpdateStoreRequest request
    ) {
        StoreResponse response = storeService.updateStore(storeId, request);
        return ResponseEntity.ok(response);
    }

    /**
     * Atualiza apenas a configuração de background de uma loja
     * Requer plano BASIC ou superior
     */
    @PutMapping("/{storeId}/background")
    @Operation(summary = "Atualizar configuração de background", description = "Atualiza as configurações de background da loja. Disponível apenas para planos BASIC e PRO (apenas OWNER e MANAGER)")
    @SecurityRequirement(name = "bearerAuth")
    public ResponseEntity<StoreResponse> updateBackground(
            @PathVariable UUID storeId,
            @RequestBody UpdateBackgroundRequest request
    ) {
        StoreResponse response = storeService.updateBackground(storeId, request);
        return ResponseEntity.ok(response);
    }

    /**
     * Atualiza a configuração de tema de uma loja
     */
    @PutMapping("/{storeId}/theme")
    @Operation(summary = "Atualizar configuração de tema", description = "Atualiza as configurações de tema da loja (apenas OWNER e MANAGER)")
    @SecurityRequirement(name = "bearerAuth")
    public ResponseEntity<StoreResponse> updateThemeConfig(
            @PathVariable UUID storeId,
            @RequestBody UpdateThemeConfigRequest request
    ) {
        StoreResponse response = storeService.updateThemeConfig(storeId, request);
        return ResponseEntity.ok(response);
    }

    /**
     * Busca uma loja por ID
     */
    @GetMapping("/{storeId}")
    @Operation(summary = "Buscar loja", description = "Retorna os detalhes de uma loja específica")
    @SecurityRequirement(name = "bearerAuth")
    public ResponseEntity<StoreResponse> getStore(@PathVariable UUID storeId) {
        StoreResponse response = storeService.getStoreById(storeId);
        return ResponseEntity.ok(response);
    }

    /**
     * Busca uma loja por slug (público)
     */
    @GetMapping("/by-slug/{slug}")
    @Operation(summary = "Buscar loja por slug", description = "Retorna os detalhes de uma loja pelo slug (endpoint público)")
    public ResponseEntity<StoreResponse> getStoreBySlug(@PathVariable String slug) {
        StoreResponse response = storeService.getStoreBySlug(slug);
        return ResponseEntity.ok(response);
    }

    /**
     * Busca uma loja pública completa com categorias e produtos (público)
     */
    @GetMapping("/public/{slug}")
    @Operation(summary = "Buscar loja pública completa", description = "Retorna loja com categorias e produtos agrupados (endpoint público)")
    public ResponseEntity<StorePublicResponse> getPublicStoreBySlug(@PathVariable String slug) {
        StorePublicResponse response = storeService.getPublicStoreBySlug(slug);
        return ResponseEntity.ok(response);
    }

    /**
     * Busca todas as lojas de um usuário
     */
    @GetMapping("/user/{userId}")
    @Operation(summary = "Listar lojas do usuário", description = "Retorna todas as lojas associadas a um usuário")
    @SecurityRequirement(name = "bearerAuth")
    public ResponseEntity<List<StoreUserResponse>> getUserStores(@PathVariable UUID userId) {
        List<StoreUserResponse> response = storeService.getUserStores(userId);
        return ResponseEntity.ok(response);
    }

    /**
     * Adiciona um usuário a uma loja
     */
    @PostMapping("/{storeId}/users")
    @Operation(summary = "Adicionar usuário à loja", description = "Adiciona um usuário com uma função específica à loja (apenas OWNER e MANAGER)")
    @SecurityRequirement(name = "bearerAuth")
    public ResponseEntity<StoreUserResponse> addUserToStore(
            @PathVariable UUID storeId,
            @RequestBody AddUserToStoreRequest request
    ) {
        StoreUserResponse response = storeService.addUserToStore(storeId, request.userId(), request.role());
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    /**
     * Remove um usuário de uma loja (soft delete)
     */
    @DeleteMapping("/{storeId}/users/{userId}")
    @Operation(summary = "Remover usuário da loja", description = "Remove um usuário da loja (soft delete) (apenas OWNER e MANAGER)")
    @SecurityRequirement(name = "bearerAuth")
    public ResponseEntity<Void> removeUserFromStore(
            @PathVariable UUID storeId,
            @PathVariable UUID userId
    ) {
        storeService.removeUserFromStore(storeId, userId);
        return ResponseEntity.noContent().build();
    }

    /**
     * Lista todos os usuários de uma loja
     */
    @GetMapping("/{storeId}/users")
    @Operation(summary = "Listar usuários da loja", description = "Retorna todos os usuários associados à loja")
    @SecurityRequirement(name = "bearerAuth")
    public ResponseEntity<List<StoreUserResponse>> getStoreUsers(@PathVariable UUID storeId) {
        List<StoreUserResponse> response = storeService.getStoreUsers(storeId);
        return ResponseEntity.ok(response);
    }

    /**
     * Verifica se um slug está disponível
     */
    @GetMapping("/check-slug-availability")
    @Operation(summary = "Verificar disponibilidade de slug", description = "Retorna true se o slug está disponível, false caso contrário")
    public ResponseEntity<Boolean> checkSlugAvailability(@RequestParam String slug) {
        boolean isAvailable = storeService.isSlugAvailable(slug);
        return ResponseEntity.ok(isAvailable);
    }
}

