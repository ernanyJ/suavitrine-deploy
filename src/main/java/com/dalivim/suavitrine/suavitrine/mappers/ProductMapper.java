package com.dalivim.suavitrine.suavitrine.mappers;

import com.dalivim.suavitrine.suavitrine.dtos.CreateProductRequest;
import com.dalivim.suavitrine.suavitrine.dtos.UpdateProductRequest;
import com.dalivim.suavitrine.suavitrine.entities.Product;
import org.mapstruct.*;

@Mapper(componentModel = "spring", uses = {ProductVariationMapper.class, ProductImageMapper.class})
public interface ProductMapper {

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "store", ignore = true)
    @Mapping(target = "category", ignore = true)
    @Mapping(target = "images", ignore = true)
    @Mapping(target = "variations", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    @Mapping(target = "deletedAt", ignore = true)
    Product toEntity(CreateProductRequest request);

    @BeanMapping(nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "store", ignore = true)
    @Mapping(target = "category", ignore = true)
    @Mapping(target = "images", ignore = true)
    @Mapping(target = "variations", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    @Mapping(target = "deletedAt", ignore = true)
    void updateEntityFromDto(UpdateProductRequest request, @MappingTarget Product product);
}

