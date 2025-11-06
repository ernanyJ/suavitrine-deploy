package com.dalivim.suavitrine.suavitrine.dtos;

import com.dalivim.suavitrine.suavitrine.entities.UserRole;

import java.time.Instant;
import java.util.UUID;

public record StoreUserResponse(
        UUID id,
        UUID storeId,
        String storeName,
        UUID userId,
        String userName,
        String userEmail,
        UserRole role,
        Instant createdAt
) {
}

