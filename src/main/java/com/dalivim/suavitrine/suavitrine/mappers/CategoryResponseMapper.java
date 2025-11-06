package com.dalivim.suavitrine.suavitrine.mappers;

import com.dalivim.suavitrine.suavitrine.dtos.CategoryResponse;
import com.dalivim.suavitrine.suavitrine.entities.Category;

import java.util.List;

public interface CategoryResponseMapper {

    CategoryResponse toDto(Category category);

    List<CategoryResponse> toDtoList(List<Category> categories);
}

