package com.dalivim.suavitrine.suavitrine.mappers;

import com.dalivim.suavitrine.suavitrine.dtos.CategoryWithProductsResponse;
import com.dalivim.suavitrine.suavitrine.entities.Category;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

import java.util.List;

@Mapper(componentModel = "spring", uses = {ProductBasicMapper.class})
public interface CategoryWithProductsMapper {
    
    @Mapping(target = "products", ignore = true)
    @Mapping(target = "storeId", source = "store.id")
    CategoryWithProductsResponse toDto(Category category);
    
    List<CategoryWithProductsResponse> toDtoList(List<Category> categories);
}

