package com.dalivim.suavitrine.suavitrine.dtos;

import java.time.Instant;
import java.util.UUID;

public record ProductImageResponse(
        UUID id,
        String url,
        Integer displayOrder,
        Instant createdAt,
        Instant updatedAt
) {
}



