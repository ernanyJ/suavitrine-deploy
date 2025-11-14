package com.dalivim.suavitrine.suavitrine.dtos;

import com.dalivim.suavitrine.suavitrine.entities.UserRole;

import java.util.UUID;

public record AddUserToStoreRequest(
        UUID userId,
        UserRole role
) {
}

