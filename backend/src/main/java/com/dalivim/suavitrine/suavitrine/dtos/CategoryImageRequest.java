package com.dalivim.suavitrine.suavitrine.dtos;

public record CategoryImageRequest(
        String base64Image,
        String fileName,
        String contentType
) {
}

