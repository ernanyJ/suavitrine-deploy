package com.dalivim.suavitrine.suavitrine.mappers;

import com.dalivim.suavitrine.suavitrine.dtos.StoreResponse;
import com.dalivim.suavitrine.suavitrine.entities.Store;
import org.mapstruct.Mapper;

import java.util.List;

@Mapper(componentModel = "spring")
public interface StoreResponseMapper {
    
    StoreResponse toDto(Store store);
    
    List<StoreResponse> toDtoList(List<Store> stores);
}

