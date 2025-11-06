package com.dalivim.suavitrine.suavitrine.dtos;

import java.time.Instant;
import java.util.UUID;

public record ProductVariationResponse(
        UUID id,
        String title,
        String imageUrl,
        Instant createdAt,
        Instant updatedAt
) {
}

