package com.dalivim.suavitrine.suavitrine.mappers;

import com.dalivim.suavitrine.suavitrine.dtos.StorePublicResponse;
import com.dalivim.suavitrine.suavitrine.entities.Store;
import org.mapstruct.Mapper;

import java.util.List;

@Mapper(componentModel = "spring", uses = {CategoryWithProductsMapper.class, AddressMapper.class})
public interface StorePublicMapper {
    
    StorePublicResponse toDto(Store store);
    
    List<StorePublicResponse> toDtoList(List<Store> stores);
}

