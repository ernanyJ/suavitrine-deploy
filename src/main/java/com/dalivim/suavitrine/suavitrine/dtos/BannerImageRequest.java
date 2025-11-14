package com.dalivim.suavitrine.suavitrine.dtos;

public record BannerImageRequest(
        String base64Image,
        String fileName,
        String contentType
) {
}

