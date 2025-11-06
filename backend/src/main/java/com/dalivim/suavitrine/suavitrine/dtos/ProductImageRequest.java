package com.dalivim.suavitrine.suavitrine.dtos;

public record ProductImageRequest(
        String base64Image,
        String fileName,
        String contentType,
        Integer displayOrder
) {
}

