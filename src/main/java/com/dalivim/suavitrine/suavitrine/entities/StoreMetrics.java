package com.dalivim.suavitrine.suavitrine.entities;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.Instant;
import java.time.LocalDate;
import java.util.UUID;

@Entity
@Table(name = "store_metrics", indexes = {
    @Index(name = "idx_store_metrics_store_id", columnList = "store_id"),
    @Index(name = "idx_store_metrics_date", columnList = "date"),
    @Index(name = "idx_store_metrics_store_date", columnList = "store_id, date")
})
@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class StoreMetrics {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "store_id", nullable = false)
    private Store store;

    @Column(name = "date", nullable = false)
    private LocalDate date; // Data do dia das métricas

    // Métricas de acesso
    @Column(name = "daily_accesses", nullable = false)
    @Builder.Default
    private Integer dailyAccesses = 0;

    // Métricas de produtos
    @Column(name = "product_clicks", nullable = false)
    @Builder.Default
    private Integer productClicks = 0;

    @Column(name = "product_conversions", nullable = false)
    @Builder.Default
    private Integer productConversions = 0;

    // Métricas de categorias
    @Column(name = "category_clicks", nullable = false)
    @Builder.Default
    private Integer categoryClicks = 0;

    @Column(name = "category_accesses", nullable = false)
    @Builder.Default
    private Integer categoryAccesses = 0;

    // Top produtos do dia (JSON com array de {productId, clicks, conversions})
    @Column(name = "top_products", length = 2000)
    private String topProducts;

    // Top categorias do dia (JSON com array de {categoryId, clicks, accesses})
    @Column(name = "top_categories", length = 2000)
    private String topCategories;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private Instant updatedAt;
}
