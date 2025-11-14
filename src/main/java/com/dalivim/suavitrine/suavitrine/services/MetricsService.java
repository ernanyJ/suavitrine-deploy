package com.dalivim.suavitrine.suavitrine.services;

import com.dalivim.suavitrine.suavitrine.dtos.StoreEventRequest;
import com.dalivim.suavitrine.suavitrine.dtos.StoreEventResponse;
import com.dalivim.suavitrine.suavitrine.dtos.StoreMetricsResponse;
import com.dalivim.suavitrine.suavitrine.entities.*;
import com.dalivim.suavitrine.suavitrine.repositories.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneOffset;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class MetricsService {

    private final StoreEventRepository storeEventRepository;
    private final StoreMetricsRepository storeMetricsRepository;
    private final StoreRepository storeRepository;
    private final ProductRepository productRepository;
    private final CategoryRepository categoryRepository;

    @Transactional
    public StoreEventResponse createEvent(UUID storeId, StoreEventRequest request) {
        log.info("Creating event for store {}: {}", storeId, request.getEventType());
        
        Store store = storeRepository.findById(storeId)
                .orElseThrow(() -> new RuntimeException("Store not found"));

        StoreEvent event = StoreEvent.builder()
                .store(store)
                .eventType(request.getEventType())
                .entityId(request.getEntityId())
                .entityType(request.getEntityType())
                .metadata(request.getMetadata())
                .build();

        StoreEvent savedEvent = storeEventRepository.save(event);
        
        // Processar métricas em background (assíncrono seria ideal, mas para MVP vamos fazer síncrono)
        updateDailyMetrics(storeId, Instant.now());
        
        // Converte para DTO de resposta
        return StoreEventResponse.builder()
                .id(savedEvent.getId())
                .storeId(savedEvent.getStore().getId())
                .eventType(savedEvent.getEventType().name())
                .entityId(savedEvent.getEntityId())
                .entityType(savedEvent.getEntityType() != null ? savedEvent.getEntityType().name() : null)
                .metadata(savedEvent.getMetadata())
                .createdAt(savedEvent.getCreatedAt())
                .build();
    }

    @Transactional
    public void updateDailyMetrics(UUID storeId, Instant date) {
        log.info("Updating daily metrics for store {} on date {}", storeId, date);
        
        // Normalizar data para início do dia
        LocalDate localDate = LocalDate.ofInstant(date, ZoneOffset.UTC);
        Instant startOfDay = localDate.atStartOfDay().toInstant(ZoneOffset.UTC);
        Instant endOfDay = startOfDay.plusSeconds(86400); // 24 horas depois

        // Buscar ou criar métricas do dia
        StoreMetrics dailyMetrics = storeMetricsRepository.findByStoreIdAndDate(storeId, localDate)
                .orElse(StoreMetrics.builder()
                        .store(storeRepository.findById(storeId).orElseThrow())
                        .date(localDate)
                        .build());

        // Recalcular métricas do dia
        Long dailyAccesses = storeEventRepository.countByStoreIdAndEventTypeAndEntityIdAndDateRange(
                storeId, StoreEvent.EventType.STORE_ACCESS, null, startOfDay, endOfDay);
        
        Long productClicks = storeEventRepository.countByStoreIdAndEventTypeAndEntityIdAndDateRange(
                storeId, StoreEvent.EventType.PRODUCT_CLICK, null, startOfDay, endOfDay);
        
        Long productConversions = storeEventRepository.countByStoreIdAndEventTypeAndEntityIdAndDateRange(
                storeId, StoreEvent.EventType.PRODUCT_CONVERSION, null, startOfDay, endOfDay);
        
        Long categoryClicks = storeEventRepository.countByStoreIdAndEventTypeAndEntityIdAndDateRange(
                storeId, StoreEvent.EventType.CATEGORY_CLICK, null, startOfDay, endOfDay);
        
        Long categoryAccesses = storeEventRepository.countByStoreIdAndEventTypeAndEntityIdAndDateRange(
                storeId, StoreEvent.EventType.CATEGORY_ACCESS, null, startOfDay, endOfDay);

        // Atualizar métricas
        dailyMetrics.setDailyAccesses(dailyAccesses.intValue());
        dailyMetrics.setProductClicks(productClicks.intValue());
        dailyMetrics.setProductConversions(productConversions.intValue());
        dailyMetrics.setCategoryClicks(categoryClicks.intValue());
        dailyMetrics.setCategoryAccesses(categoryAccesses.intValue());

        // Calcular top produtos e categorias do dia
        updateTopProductsAndCategories(dailyMetrics, storeId, startOfDay, endOfDay);

        storeMetricsRepository.save(dailyMetrics);
    }

    private void updateTopProductsAndCategories(StoreMetrics dailyMetrics, UUID storeId, Instant startOfDay, Instant endOfDay) {
        // Top produtos por cliques
        List<Object[]> topProductClicks = storeEventRepository.findTopEntitiesByEventTypeAndDateRange(
                storeId, StoreEvent.EventType.PRODUCT_CLICK, startOfDay, endOfDay);
        
        // Top produtos por conversões
        List<Object[]> topProductConversions = storeEventRepository.findTopEntitiesByEventTypeAndDateRange(
                storeId, StoreEvent.EventType.PRODUCT_CONVERSION, startOfDay, endOfDay);
        
        // Top categorias por cliques
        List<Object[]> topCategoryClicks = storeEventRepository.findTopEntitiesByEventTypeAndDateRange(
                storeId, StoreEvent.EventType.CATEGORY_CLICK, startOfDay, endOfDay);
        
        // Top categorias por acessos
        List<Object[]> topCategoryAccesses = storeEventRepository.findTopEntitiesByEventTypeAndDateRange(
                storeId, StoreEvent.EventType.CATEGORY_ACCESS, startOfDay, endOfDay);

        // Converter para JSON (simplificado para MVP)
        dailyMetrics.setTopProducts(convertToJson(topProductClicks, topProductConversions));
        dailyMetrics.setTopCategories(convertToJson(topCategoryClicks, topCategoryAccesses));
    }

    private String convertToJson(List<Object[]> clicks, List<Object[]> conversions) {
        // Implementação simplificada para MVP - em produção usar Jackson ou Gson
        Map<String, Object> result = new HashMap<>();
        result.put("clicks", clicks.stream().map(arr -> Map.of("id", arr[0], "count", arr[1])).collect(Collectors.toList()));
        result.put("conversions", conversions.stream().map(arr -> Map.of("id", arr[0], "count", arr[1])).collect(Collectors.toList()));
        return result.toString(); // Simplificado - usar JSON serializer adequado
    }

    public StoreMetricsResponse getStoreMetrics(UUID storeId, int days) {
        log.info("Getting metrics for store {} for last {} days", storeId, days);
        
        Store store = storeRepository.findById(storeId)
                .orElseThrow(() -> new RuntimeException("Store not found"));

        Instant endDate = Instant.now();
        Instant startDate = endDate.minusSeconds(days * 86400L); // days * 24 * 60 * 60
        
        // Converter para LocalDate para busca de métricas agregadas
        LocalDate startLocalDate = LocalDate.ofInstant(startDate, ZoneOffset.UTC);
        LocalDate endLocalDate = LocalDate.ofInstant(endDate, ZoneOffset.UTC);

        // Buscar métricas agregadas
        List<StoreMetrics> metrics = storeMetricsRepository.findByStoreIdAndDateRange(storeId, startLocalDate, endLocalDate);
        
        // Calcular totais
        Long totalAccesses = storeMetricsRepository.getTotalAccessesByStoreIdAndDateRange(storeId, startLocalDate, endLocalDate);
        Long totalProductClicks = storeMetricsRepository.getTotalProductClicksByStoreIdAndDateRange(storeId, startLocalDate, endLocalDate);
        Long totalProductConversions = storeMetricsRepository.getTotalProductConversionsByStoreIdAndDateRange(storeId, startLocalDate, endLocalDate);
        Long totalCategoryClicks = storeMetricsRepository.getTotalCategoryClicksByStoreIdAndDateRange(storeId, startLocalDate, endLocalDate);
        Long totalCategoryAccesses = storeMetricsRepository.getTotalCategoryAccessesByStoreIdAndDateRange(storeId, startLocalDate, endLocalDate);

        // Converter métricas diárias
        List<StoreMetricsResponse.DailyMetrics> dailyMetrics = metrics.stream()
                .map(m -> {
                    // Converter LocalDate para Instant (início do dia)
                    Instant dateInstant = m.getDate().atStartOfDay(ZoneOffset.UTC).toInstant();
                    return StoreMetricsResponse.DailyMetrics.builder()
                            .date(dateInstant)
                            .accesses(m.getDailyAccesses().longValue())
                            .productClicks(m.getProductClicks().longValue())
                            .productConversions(m.getProductConversions().longValue())
                            .categoryClicks(m.getCategoryClicks().longValue())
                            .categoryAccesses(m.getCategoryAccesses().longValue())
                            .build();
                })
                .collect(Collectors.toList());

        // Buscar top produtos e categorias do período
        List<StoreMetricsResponse.ProductMetrics> topProductsByClicks = getTopProductsByClicks(storeId, startDate, endDate);
        List<StoreMetricsResponse.ProductMetrics> topProductsByConversions = getTopProductsByConversions(storeId, startDate, endDate);
        List<StoreMetricsResponse.CategoryMetrics> topCategoriesByClicks = getTopCategoriesByClicks(storeId, startDate, endDate);
        List<StoreMetricsResponse.CategoryMetrics> topCategoriesByAccesses = getTopCategoriesByAccesses(storeId, startDate, endDate);

        return StoreMetricsResponse.builder()
                .storeId(storeId.toString())
                .storeName(store.getName())
                .startDate(startDate)
                .endDate(endDate)
                .totalAccesses(totalAccesses != null ? totalAccesses : 0L)
                .totalProductClicks(totalProductClicks != null ? totalProductClicks : 0L)
                .totalProductConversions(totalProductConversions != null ? totalProductConversions : 0L)
                .totalCategoryClicks(totalCategoryClicks != null ? totalCategoryClicks : 0L)
                .totalCategoryAccesses(totalCategoryAccesses != null ? totalCategoryAccesses : 0L)
                .dailyMetrics(dailyMetrics)
                .topProductsByClicks(topProductsByClicks)
                .topProductsByConversions(topProductsByConversions)
                .topCategoriesByClicks(topCategoriesByClicks)
                .topCategoriesByAccesses(topCategoriesByAccesses)
                .build();
    }

    private List<StoreMetricsResponse.ProductMetrics> getTopProductsByClicks(UUID storeId, Instant startDate, Instant endDate) {
        List<Object[]> results = storeEventRepository.findTopEntitiesByEventTypeAndDateRange(
                storeId, StoreEvent.EventType.PRODUCT_CLICK, startDate, endDate);
        
        return results.stream()
                .limit(10) // Top 10
                .map(arr -> {
                    UUID productId = (UUID) arr[0];
                    Long clicks = (Long) arr[1];
                    
                    Product product = productRepository.findById(productId).orElse(null);
                    String productTitle = product != null ? product.getTitle() : "Produto não encontrado";
                    
                    return StoreMetricsResponse.ProductMetrics.builder()
                            .productId(productId.toString())
                            .productTitle(productTitle)
                            .clicks(clicks)
                            .conversions(0L) // Seria calculado separadamente
                            .conversionRate(0.0)
                            .build();
                })
                .collect(Collectors.toList());
    }

    private List<StoreMetricsResponse.ProductMetrics> getTopProductsByConversions(UUID storeId, Instant startDate, Instant endDate) {
        List<Object[]> results = storeEventRepository.findTopEntitiesByEventTypeAndDateRange(
                storeId, StoreEvent.EventType.PRODUCT_CONVERSION, startDate, endDate);
        
        return results.stream()
                .limit(10)
                .map(arr -> {
                    UUID productId = (UUID) arr[0];
                    Long conversions = (Long) arr[1];
                    
                    Product product = productRepository.findById(productId).orElse(null);
                    String productTitle = product != null ? product.getTitle() : "Produto não encontrado";
                    
                    return StoreMetricsResponse.ProductMetrics.builder()
                            .productId(productId.toString())
                            .productTitle(productTitle)
                            .clicks(0L) // Seria calculado separadamente
                            .conversions(conversions)
                            .conversionRate(0.0)
                            .build();
                })
                .collect(Collectors.toList());
    }

    private List<StoreMetricsResponse.CategoryMetrics> getTopCategoriesByClicks(UUID storeId, Instant startDate, Instant endDate) {
        List<Object[]> results = storeEventRepository.findTopEntitiesByEventTypeAndDateRange(
                storeId, StoreEvent.EventType.CATEGORY_CLICK, startDate, endDate);
        
        return results.stream()
                .limit(10)
                .map(arr -> {
                    UUID categoryId = (UUID) arr[0];
                    Long clicks = (Long) arr[1];
                    
                    Category category = categoryRepository.findById(categoryId).orElse(null);
                    String categoryName = category != null ? category.getName() : "Categoria não encontrada";
                    
                    return StoreMetricsResponse.CategoryMetrics.builder()
                            .categoryId(categoryId.toString())
                            .categoryName(categoryName)
                            .clicks(clicks)
                            .accesses(0L) // Seria calculado separadamente
                            .build();
                })
                .collect(Collectors.toList());
    }

    private List<StoreMetricsResponse.CategoryMetrics> getTopCategoriesByAccesses(UUID storeId, Instant startDate, Instant endDate) {
        List<Object[]> results = storeEventRepository.findTopEntitiesByEventTypeAndDateRange(
                storeId, StoreEvent.EventType.CATEGORY_ACCESS, startDate, endDate);
        
        return results.stream()
                .limit(10)
                .map(arr -> {
                    UUID categoryId = (UUID) arr[0];
                    Long accesses = (Long) arr[1];
                    
                    Category category = categoryRepository.findById(categoryId).orElse(null);
                    String categoryName = category != null ? category.getName() : "Categoria não encontrada";
                    
                    return StoreMetricsResponse.CategoryMetrics.builder()
                            .categoryId(categoryId.toString())
                            .categoryName(categoryName)
                            .clicks(0L) // Seria calculado separadamente
                            .accesses(accesses)
                            .build();
                })
                .collect(Collectors.toList());
    }
}
