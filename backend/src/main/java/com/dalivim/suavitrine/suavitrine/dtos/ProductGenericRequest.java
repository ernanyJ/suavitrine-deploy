package com.dalivim.suavitrine.suavitrine.dtos;

import java.util.UUID;

public record ProductGenericRequest(
        UUID existingImage,
        ProductImageRequest newImage
        ) {
}
