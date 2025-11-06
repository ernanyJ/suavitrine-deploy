package com.dalivim.suavitrine.suavitrine.controllers.v1;

import com.dalivim.suavitrine.suavitrine.dtos.StoreEventRequest;
import com.dalivim.suavitrine.suavitrine.dtos.StoreEventResponse;
import com.dalivim.suavitrine.suavitrine.dtos.StoreMetricsResponse;
import com.dalivim.suavitrine.suavitrine.entities.StoreEvent;
import com.dalivim.suavitrine.suavitrine.services.MetricsService;
import com.dalivim.suavitrine.suavitrine.services.StoreService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import jakarta.servlet.http.HttpServletRequest;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/metrics")
@RequiredArgsConstructor
@Tag(name = "Metrics", description = "Endpoints para métricas da loja")
@SecurityRequirement(name = "bearerAuth")
public class MetricsController {

    private final MetricsService metricsService;
    private final StoreService storeService;

    @PostMapping("/events")
    @Operation(summary = "Registrar evento de métrica", description = "Registra um novo evento para análise de métricas")
    public ResponseEntity<StoreEventResponse> createEvent(
            @RequestBody StoreEventRequest request) {
        
        UUID storeId = storeService.getCurrentUserStore().getId();
        StoreEventResponse response = metricsService.createEvent(storeId, request);
        
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping("/store/{storeId}")
    @Operation(summary = "Obter métricas da loja", description = "Retorna métricas agregadas da loja para os últimos N dias")
    public ResponseEntity<StoreMetricsResponse> getStoreMetrics(
            @PathVariable UUID storeId,
            @RequestParam(defaultValue = "30") int days) {
        
        // Verificar se o usuário tem acesso à loja
        UUID userStoreId = storeService.getCurrentUserStore().getId();
        if (!userStoreId.equals(storeId)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }
        
        StoreMetricsResponse metrics = metricsService.getStoreMetrics(storeId, days);
        return ResponseEntity.ok(metrics);
    }

    @GetMapping("/store/{storeId}/daily")
    @Operation(summary = "Obter métricas diárias", description = "Retorna métricas agregadas da loja para os últimos 30 dias")
    public ResponseEntity<StoreMetricsResponse> getDailyMetrics(
            @PathVariable UUID storeId) {
        
        // Verificar se o usuário tem acesso à loja
        UUID userStoreId = storeService.getCurrentUserStore().getId();
        if (!userStoreId.equals(storeId)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }
        
        StoreMetricsResponse metrics = metricsService.getStoreMetrics(storeId, 30);
        return ResponseEntity.ok(metrics);
    }

    @PostMapping("/events/store-access/{storeId}")
    @Operation(summary = "Registrar acesso à loja", description = "Registra um acesso à página da loja")
    public ResponseEntity<StoreEventResponse> recordStoreAccess(
            @PathVariable UUID storeId,
            HttpServletRequest httpRequest) {
        
        StoreEventRequest request = StoreEventRequest.builder()
                .eventType(StoreEvent.EventType.STORE_ACCESS)
                .entityType(StoreEvent.EntityType.STORE)
                .entityId(storeId)
                .metadata("{\"userAgent\":\"" + httpRequest.getHeader("User-Agent") + "\"}")
                .build();
        
        StoreEventResponse response = metricsService.createEvent(storeId, request);
        
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PostMapping("/events/product-click/{storeId}/{productId}")
    @Operation(summary = "Registrar clique em produto", description = "Registra um clique em um produto específico")
    public ResponseEntity<StoreEventResponse> recordProductClick(
            @PathVariable UUID storeId,
            @PathVariable UUID productId,
            HttpServletRequest httpRequest) {
        
        StoreEventRequest request = StoreEventRequest.builder()
                .eventType(StoreEvent.EventType.PRODUCT_CLICK)
                .entityType(StoreEvent.EntityType.PRODUCT)
                .entityId(productId)
                .metadata("{\"userAgent\":\"" + httpRequest.getHeader("User-Agent") + "\"}")
                .build();
        
        StoreEventResponse response = metricsService.createEvent(storeId, request);
        
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PostMapping("/events/product-conversion/{storeId}/{productId}")
    @Operation(summary = "Registrar conversão de produto", description = "Registra uma conversão (compra/contato) de um produto")
    public ResponseEntity<StoreEventResponse> recordProductConversion(
            @PathVariable UUID storeId,
            @PathVariable UUID productId,
            @RequestBody(required = false) String conversionData,
            HttpServletRequest httpRequest) {
                
        StoreEventRequest request = StoreEventRequest.builder()
                .eventType(StoreEvent.EventType.PRODUCT_CONVERSION)
                .entityType(StoreEvent.EntityType.PRODUCT)
                .entityId(productId)
                .metadata(conversionData != null ? conversionData : "{\"type\":\"conversion\"}")
                .build();
        
        StoreEventResponse response = metricsService.createEvent(storeId, request);
        
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PostMapping("/events/category-click/{storeId}/{categoryId}")
    @Operation(summary = "Registrar clique em categoria", description = "Registra um clique em uma categoria específica")
    public ResponseEntity<StoreEventResponse> recordCategoryClick(
            @PathVariable UUID storeId,
            @PathVariable UUID categoryId,
            HttpServletRequest httpRequest) {
        
        StoreEventRequest request = StoreEventRequest.builder()
                .eventType(StoreEvent.EventType.CATEGORY_CLICK)
                .entityType(StoreEvent.EntityType.CATEGORY)
                .entityId(categoryId)
                .metadata("{\"userAgent\":\"" + httpRequest.getHeader("User-Agent") + "\"}")
                .build();
        
        StoreEventResponse response = metricsService.createEvent(storeId, request);
        
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PostMapping("/events/category-access/{categoryId}")
    @Operation(summary = "Registrar acesso à categoria", description = "Registra um acesso à página de uma categoria")
    public ResponseEntity<StoreEventResponse> recordCategoryAccess(
            @PathVariable UUID categoryId,
            HttpServletRequest httpRequest) {
        
        UUID storeId = storeService.getCurrentUserStore().getId();
        
        StoreEventRequest request = StoreEventRequest.builder()
                .eventType(StoreEvent.EventType.CATEGORY_ACCESS)
                .entityType(StoreEvent.EntityType.CATEGORY)
                .entityId(categoryId)
                .metadata("{\"userAgent\":\"" + httpRequest.getHeader("User-Agent") + "\"}")
                .build();
        
        StoreEventResponse response = metricsService.createEvent(storeId, request);
        
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }
}