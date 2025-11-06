package com.dalivim.suavitrine.suavitrine.mappers;

import com.dalivim.suavitrine.suavitrine.dtos.ProductVariationResponse;
import com.dalivim.suavitrine.suavitrine.entities.ProductVariation;
import org.mapstruct.Mapper;

import java.util.List;

@Mapper(componentModel = "spring")
public interface ProductVariationResponseMapper {

    ProductVariationResponse toDto(ProductVariation variation);

    List<ProductVariationResponse> toDtoList(List<ProductVariation> variations);
}

