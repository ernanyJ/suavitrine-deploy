package com.dalivim.suavitrine.suavitrine.dtos;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

public record ProductResponse(
        UUID id,
        String title,
        Integer price,
        Integer promotionalPrice,
        Boolean showPromotionBadge,
        String description,
        UUID storeId,
        CategoryResponse category,
        Integer displayOrder,
        Boolean available,
        List<ProductImageResponse> images,
        List<ProductVariationResponse> variations,
        Instant createdAt,
        Instant updatedAt
) {
}

