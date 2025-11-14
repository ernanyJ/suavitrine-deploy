package com.dalivim.suavitrine.suavitrine.mappers;

import com.dalivim.suavitrine.suavitrine.dtos.ProductImageResponse;
import com.dalivim.suavitrine.suavitrine.entities.ProductImage;
import org.mapstruct.Mapper;

import java.util.List;

@Mapper(componentModel = "spring")
public interface ProductImageResponseMapper {

    ProductImageResponse toDto(ProductImage image);

    List<ProductImageResponse> toDtoList(List<ProductImage> images);
}



