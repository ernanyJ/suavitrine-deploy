package com.dalivim.suavitrine.suavitrine.dtos;

import java.util.List;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Builder;

@Builder
@Schema(hidden = true)
public record CreateAbacateBillingResponse(
    BillingData data,
    String error
) {
    @Builder
    public record BillingData(
        String id,
        String url,
        int amount,
        String status,
        boolean devMode,
        List<String> methods,
        List<Product> products,
        String frequency,
        String nextBilling,
        Customer customer,
        boolean allowCoupons,
        List<String> coupons
    ) {}

    @Builder
    public record Product(
        String id,
        String externalId,
        int quantity
    ) {}

    @Builder
    public record Customer(
        String id,
        CustomerMetadata metadata
    ) {}

    @Builder
    public record CustomerMetadata(
        String name,
        String cellphone,
        String email,
        String taxId
    ) {}
}

