package com.dalivim.suavitrine.suavitrine.dtos;

import java.util.UUID;

public record CreateCategoryRequest(
        String name,
        String description,
        UUID storeId,
        CategoryImageRequest image
) {
}

