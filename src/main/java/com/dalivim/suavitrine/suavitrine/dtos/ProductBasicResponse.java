package com.dalivim.suavitrine.suavitrine.dtos;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

public record ProductBasicResponse(
        UUID id,
        String title,
        Integer price,
        Integer promotionalPrice,
        Boolean showPromotionBadge,
        String description,
        Boolean available,
        List<ProductImageResponse> images,
        Instant createdAt,
        Instant updatedAt
) {
}

