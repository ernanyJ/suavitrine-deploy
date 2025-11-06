package com.dalivim.suavitrine.suavitrine.dtos;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;
import java.util.List;
import java.util.Map;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class StoreMetricsResponse {
    private String storeId;
    private String storeName;
    private Instant startDate;
    private Instant endDate;
    
    // Métricas gerais
    private Long totalAccesses;
    private Long totalProductClicks;
    private Long totalProductConversions;
    private Long totalCategoryClicks;
    private Long totalCategoryAccesses;
    
    // Métricas por dia (últimos 30 dias)
    private List<DailyMetrics> dailyMetrics;
    
    // Top produtos
    private List<ProductMetrics> topProductsByClicks;
    private List<ProductMetrics> topProductsByConversions;
    
    // Top categorias
    private List<CategoryMetrics> topCategoriesByClicks;
    private List<CategoryMetrics> topCategoriesByAccesses;
    
    @Data
    @Builder
    @AllArgsConstructor
    @NoArgsConstructor
    public static class DailyMetrics {
        private Instant date;
        private Long accesses;
        private Long productClicks;
        private Long productConversions;
        private Long categoryClicks;
        private Long categoryAccesses;
    }
    
    @Data
    @Builder
    @AllArgsConstructor
    @NoArgsConstructor
    public static class ProductMetrics {
        private String productId;
        private String productTitle;
        private Long clicks;
        private Long conversions;
        private Double conversionRate;
    }
    
    @Data
    @Builder
    @AllArgsConstructor
    @NoArgsConstructor
    public static class CategoryMetrics {
        private String categoryId;
        private String categoryName;
        private Long clicks;
        private Long accesses;
    }
}
