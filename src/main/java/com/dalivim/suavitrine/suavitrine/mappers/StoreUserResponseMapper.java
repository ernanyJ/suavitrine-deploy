package com.dalivim.suavitrine.suavitrine.mappers;

import com.dalivim.suavitrine.suavitrine.dtos.StoreUserResponse;
import com.dalivim.suavitrine.suavitrine.entities.StoreUser;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

import java.util.List;

@Mapper(componentModel = "spring")
public interface StoreUserResponseMapper {
    
    @Mapping(target = "storeId", source = "store.id")
    @Mapping(target = "storeName", source = "store.name")
    @Mapping(target = "userId", source = "user.id")
    @Mapping(target = "userName", source = "user.name")
    @Mapping(target = "userEmail", source = "user.email")
    StoreUserResponse toDto(StoreUser storeUser);
    
    List<StoreUserResponse> toDtoList(List<StoreUser> storeUsers);
}

