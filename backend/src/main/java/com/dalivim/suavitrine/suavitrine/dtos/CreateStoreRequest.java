package com.dalivim.suavitrine.suavitrine.dtos;

import org.hibernate.validator.constraints.br.CNPJ;

public record CreateStoreRequest(
        String name,
        String description,
        String slug,
        String street,
        String city,
        String state,
        String zipCode,
        String phoneNumber,
        String email,
        String instagram,
        String facebook,
        @CNPJ
        String cnpj,
        BannerImageRequest logo
) {
}

