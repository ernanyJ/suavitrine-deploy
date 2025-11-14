package com.dalivim.suavitrine.suavitrine.mappers;

import com.dalivim.suavitrine.suavitrine.dtos.AddUserToStoreRequest;
import com.dalivim.suavitrine.suavitrine.entities.StoreUser;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface StoreUserMapper {

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "store", ignore = true)
    @Mapping(target = "user", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "deletedAt", ignore = true)
    StoreUser toEntity(AddUserToStoreRequest request);
}

