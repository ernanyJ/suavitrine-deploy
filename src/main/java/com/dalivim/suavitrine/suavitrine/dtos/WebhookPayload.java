package com.dalivim.suavitrine.suavitrine.dtos;

import java.util.List;
import lombok.Builder;

@Builder
public record WebhookPayload(
    String id,
    WebhookData data,
    boolean devMode,
    String event
) {
    @Builder
    public record WebhookData(
        Payment payment,
        Billing billing
    ) {}

    @Builder
    public record Payment(
        int amount,
        int fee,
        String method
    ) {}

    @Builder
    public record Billing(
        int amount,
        List<String> couponsUsed,
        Customer customer,
        String frequency,
        String id,
        List<String> kind,
        int paidAmount,
        List<Product> products,
        String status
    ) {}

    @Builder
    public record Customer(
        String id,
        CustomerMetadata metadata
    ) {}

    @Builder
    public record CustomerMetadata(
        String cellphone,
        String email,
        String name,
        String taxId
    ) {}

    @Builder
    public record Product(
        String externalId,
        String id,
        int quantity
    ) {}
}

