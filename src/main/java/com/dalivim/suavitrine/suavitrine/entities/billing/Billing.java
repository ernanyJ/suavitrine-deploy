package com.dalivim.suavitrine.suavitrine.entities.billing;

import java.time.Instant;
import java.util.UUID;

import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import com.dalivim.suavitrine.suavitrine.entities.Store;
import com.dalivim.suavitrine.suavitrine.entities.StoreUser;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;

@Entity
@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class Billing {


    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "store_id", nullable = false)
    private Store store;

    @ManyToOne(fetch = FetchType.LAZY)
    private StoreUser payer;

    @Enumerated(EnumType.STRING)
    private PayingPlan payingPlan;

    @Enumerated(EnumType.STRING)
    private PlanDuration planDuration;

    private int price;

    /**
     * CPF ou CNPJ usado para o pagamento (obrigatório para compliance).
     */
    @Column(nullable = false)
    private String taxId;

    /**
     * ID do product na abacate.
     */
    private String externalId;

    /**
     * URL de pagamento na abacate.
     */
    private String paymentUrl;

    private Instant paidAt;

    private Instant expiresAt;

    @CreationTimestamp
    private Instant createdAt;

    /**
     * Cupons usados no pagamento, armazenado como JSON string.
     * Exemplo: ["RRFULLSTACKDEVS"]
     */
    @jakarta.persistence.Column(length = 2000)
    private String couponsUsed;

    public boolean isExpired() {
        return Instant.now().isAfter(expiresAt);
    }

}
