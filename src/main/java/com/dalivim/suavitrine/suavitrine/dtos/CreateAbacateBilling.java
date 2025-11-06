package com.dalivim.suavitrine.suavitrine.dtos;

import java.util.List;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Builder;

@Builder
@Schema(hidden = true)
public record CreateAbacateBilling(
    String frequency,
    List<String> methods,
    List<Product> products,
    String returnUrl,
    String completionUrl,
    String customerId,
    Customer customer,
    boolean allowCoupons,
    List<String> coupons,
    String externalId
) {
    @Builder
    public record Product(
        String externalId,
        String name,
        String description,
        int quantity,
        int price
    ) {}

    @Builder
    public record Customer(
        String name,
        String cellphone,
        String email,
        String taxId
    ) {}
}
