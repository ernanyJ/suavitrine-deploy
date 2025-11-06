package com.dalivim.suavitrine.suavitrine.dtos;

import java.time.Instant;
import java.util.UUID;

public record CategoryResponse(
        UUID id,
        String name,
        String description,
        String imageUrl,
        UUID storeId,
        Instant createdAt,
        Instant updatedAt
) {
}

