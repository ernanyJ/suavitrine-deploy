package com.dalivim.suavitrine.suavitrine.dtos;

import java.util.List;
import java.util.UUID;

public record CreateProductRequest(
        String title,
        Integer price,
        Integer promotionalPrice,
        Boolean showPromotionBadge,
        String description,
        UUID storeId,
        UUID categoryId,
        Integer displayOrder,
        Boolean available,
        List<ProductImageRequest> images,
        List<ProductVariationRequest> variations
) {
}

