package com.dalivim.suavitrine.suavitrine.dtos;

import java.util.UUID;

public record AddressResponse(
        UUID id,
        String street,
        String city,
        String state,
        String zipCode
) {
}

