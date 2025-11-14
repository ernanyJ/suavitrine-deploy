package com.dalivim.suavitrine.suavitrine.dtos;

import java.util.List;
import java.util.UUID;

public record UpdateProductRequest(
        String title,
        Integer price,
        Integer promotionalPrice,
        Boolean showPromotionBadge,
        String description,
        UUID categoryId,
        Integer displayOrder,
        Boolean available,
        List<ProductGenericRequest> images,
        List<ProductVariationRequest> variations
) {
}

