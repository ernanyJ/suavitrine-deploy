package com.dalivim.suavitrine.suavitrine.mappers;

import com.dalivim.suavitrine.suavitrine.dtos.ProductBasicResponse;
import com.dalivim.suavitrine.suavitrine.dtos.ProductImageResponse;
import com.dalivim.suavitrine.suavitrine.entities.Product;
import com.dalivim.suavitrine.suavitrine.entities.ProductImage;
import com.dalivim.suavitrine.suavitrine.services.ImageService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ProductBasicMapperImpl implements ProductBasicMapper {

    private final ImageService imageService;

    @Override
    public ProductBasicResponse toDto(Product product) {
        // Gera presigned URLs para todas as imagens
        List<ProductImageResponse> imageResponses = convertImagesToDto(product.getImages());
        
        return new ProductBasicResponse(
                product.getId(),
                product.getTitle(),
                product.getPrice(),
                product.getPromotionalPrice(),
                product.getShowPromotionBadge(),
                product.getDescription(),
                product.getAvailable(),
                imageResponses,
                product.getCreatedAt(),
                product.getUpdatedAt()
        );
    }

    @Override
    public List<ProductBasicResponse> toDtoList(List<Product> products) {
        if (products == null) {
            return List.of();
        }
        return products.stream()
                .map(this::toDto)
                .toList();
    }

    /**
     * Converte as imagens do produto para DTOs, gerando presigned URLs na hora
     */
    private List<ProductImageResponse> convertImagesToDto(List<ProductImage> images) {
        if (images == null || images.isEmpty()) {
            return List.of();
        }

        return images.stream()
                .map(image -> {
                    // Gera presigned URL a partir da key armazenada
                    String presignedUrl = imageService.getPresignedUrl(image.getUrl());
                    
                    return new ProductImageResponse(
                            image.getId(),
                            presignedUrl, // Presigned URL gerada dinamicamente
                            image.getDisplayOrder(),
                            image.getCreatedAt(),
                            image.getUpdatedAt()
                    );
                })
                .toList();
    }
}

