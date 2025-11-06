package com.dalivim.suavitrine.suavitrine.dtos;

import java.util.UUID;

public record AuthenticationResponse(
        String token,
        UUID userId,
        String email,
        String name
) {
}

