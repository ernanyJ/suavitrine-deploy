package com.dalivim.suavitrine.suavitrine.dtos;

public record UpdateStoreRequest(
        String name,
        String description,
        String street,
        String city,
        String state,
        String zipCode,
        String phoneNumber,
        String email,
        String instagram,
        String facebook,
        BannerImageRequest logo
) {
}

