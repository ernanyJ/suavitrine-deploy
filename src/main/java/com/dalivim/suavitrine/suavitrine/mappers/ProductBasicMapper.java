package com.dalivim.suavitrine.suavitrine.mappers;

import com.dalivim.suavitrine.suavitrine.dtos.ProductBasicResponse;
import com.dalivim.suavitrine.suavitrine.entities.Product;

import java.util.List;

public interface ProductBasicMapper {
    
    ProductBasicResponse toDto(Product product);
    
    List<ProductBasicResponse> toDtoList(List<Product> products);
}

