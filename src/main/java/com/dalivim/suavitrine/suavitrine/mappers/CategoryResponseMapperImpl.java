package com.dalivim.suavitrine.suavitrine.mappers;

import com.dalivim.suavitrine.suavitrine.dtos.CategoryResponse;
import com.dalivim.suavitrine.suavitrine.entities.Category;
import com.dalivim.suavitrine.suavitrine.services.ImageService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
@RequiredArgsConstructor
public class CategoryResponseMapperImpl implements CategoryResponseMapper {

    private final ImageService imageService;

    @Override
    public CategoryResponse toDto(Category category) {
        // Gera presigned URL a partir da key armazenada
        String imageUrl = category.getImageUrl() != null 
            ? imageService.getPresignedUrl(category.getImageUrl()) 
            : null;

        return new CategoryResponse(
                category.getId(),
                category.getName(),
                category.getDescription(),
                imageUrl, // Presigned URL gerada dinamicamente
                category.getStore().getId(),
                category.getCreatedAt(),
                category.getUpdatedAt()
        );
    }

    @Override
    public List<CategoryResponse> toDtoList(List<Category> categories) {
        if (categories == null) {
            return List.of();
        }
        return categories.stream()
                .map(this::toDto)
                .toList();
    }
}

