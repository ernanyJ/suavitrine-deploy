package com.dalivim.suavitrine.suavitrine.mappers;

import com.dalivim.suavitrine.suavitrine.dtos.CreateCategoryRequest;
import com.dalivim.suavitrine.suavitrine.dtos.UpdateCategoryRequest;
import com.dalivim.suavitrine.suavitrine.entities.Category;
import org.mapstruct.*;

@Mapper(componentModel = "spring")
public interface CategoryMapper {

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "imageUrl", ignore = true)
    @Mapping(target = "store", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    @Mapping(target = "deletedAt", ignore = true)
    Category toEntity(CreateCategoryRequest request);

    @BeanMapping(nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "imageUrl", ignore = true)
    @Mapping(target = "store", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    @Mapping(target = "deletedAt", ignore = true)
    void updateEntityFromDto(UpdateCategoryRequest request, @MappingTarget Category category);
}

