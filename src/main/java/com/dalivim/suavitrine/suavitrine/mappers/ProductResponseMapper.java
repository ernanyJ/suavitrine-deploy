package com.dalivim.suavitrine.suavitrine.mappers;

import com.dalivim.suavitrine.suavitrine.dtos.ProductResponse;
import com.dalivim.suavitrine.suavitrine.entities.Product;

import java.util.List;

public interface ProductResponseMapper {

    ProductResponse toDto(Product product);

    List<ProductResponse> toDtoList(List<Product> products);
}

