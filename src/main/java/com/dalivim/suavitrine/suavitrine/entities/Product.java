package com.dalivim.suavitrine.suavitrine.entities;

import jakarta.persistence.*;
import lombok.Data;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

@Entity
@Data
public class Product {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    private String title;

    /**
     * Preço em centavos para evitar problemas com ponto flutuante
     */
    private Integer price;

    /**
     * Preço promocional em centavos para evitar problemas com ponto flutuante
     */
    private Integer promotionalPrice;

    /**
     * Indica se deve exibir o badge de promoção
     */
    private Boolean showPromotionBadge;

    @OneToMany(cascade = CascadeType.ALL, fetch = FetchType.LAZY, mappedBy = "product")
    @OrderBy(value = "displayOrder")
    private List<ProductImage> images;

    @Column(length = 2000)
    private String description;

    @ManyToOne
    @JoinColumn(name = "store_id", nullable = false)
    private Store store;

    @ManyToOne
    @JoinColumn(name = "category_id")
    private Category category;

    @OneToMany(cascade = CascadeType.ALL, fetch = FetchType.LAZY, mappedBy = "product")
    private List<ProductVariation> variations;

    /**
     * Ordem de exibição do produto dentro da categoria
     * Valores menores aparecem primeiro
     */
    private Integer displayOrder;

    /**
     * Indica se o produto está disponível para venda
     */
    private Boolean available;

    @CreationTimestamp
    private Instant createdAt;

    @UpdateTimestamp
    private Instant updatedAt;

    private Instant deletedAt;
}

