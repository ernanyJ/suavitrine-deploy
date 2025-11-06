package com.dalivim.suavitrine.suavitrine.entities;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "store_events", indexes = {
    @Index(name = "idx_store_events_store_id", columnList = "store_id"),
    @Index(name = "idx_store_events_event_type", columnList = "event_type"),
    @Index(name = "idx_store_events_created_at", columnList = "created_at"),
    @Index(name = "idx_store_events_store_type_date", columnList = "store_id, event_type, created_at")
})
@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class StoreEvent {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "store_id", nullable = false)
    private Store store;

    @Enumerated(EnumType.STRING)
    @Column(name = "event_type", nullable = false)
    private EventType eventType;

    @Column(name = "entity_id")
    private UUID entityId; // ID do produto ou categoria relacionado ao evento

    @Column(name = "entity_type")
    @Enumerated(EnumType.STRING)
    private EntityType entityType; // PRODUCT, CATEGORY, STORE

    @Column(name = "metadata", length = 1000)
    private String metadata; // JSON com dados adicionais do evento

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    public enum EventType {
        STORE_ACCESS,           // Acesso à loja
        PRODUCT_CLICK,          // Clique em produto
        PRODUCT_CONVERSION,     // Conversão de produto (compra/contato)
        CATEGORY_CLICK,         // Clique em categoria
        CATEGORY_ACCESS         // Acesso a página de categoria
    }

    public enum EntityType {
        STORE,
        PRODUCT,
        CATEGORY
    }
}
