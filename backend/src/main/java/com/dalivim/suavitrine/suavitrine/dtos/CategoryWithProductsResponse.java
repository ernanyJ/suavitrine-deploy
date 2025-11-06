package com.dalivim.suavitrine.suavitrine.dtos;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

public record CategoryWithProductsResponse(
        UUID id,
        String name,
        String description,
        String imageUrl,
        UUID storeId,
        List<ProductBasicResponse> products,
        Instant createdAt,
        Instant updatedAt
) {
}

