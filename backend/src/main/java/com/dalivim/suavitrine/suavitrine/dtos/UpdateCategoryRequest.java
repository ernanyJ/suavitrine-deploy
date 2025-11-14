package com.dalivim.suavitrine.suavitrine.dtos;

public record UpdateCategoryRequest(
        String name,
        String description,
        CategoryImageRequest image,
        Boolean imageDelete
) {
}

