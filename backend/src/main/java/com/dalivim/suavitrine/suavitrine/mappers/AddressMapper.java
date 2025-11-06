package com.dalivim.suavitrine.suavitrine.mappers;

import com.dalivim.suavitrine.suavitrine.dtos.AddressResponse;
import com.dalivim.suavitrine.suavitrine.entities.Address;
import org.mapstruct.Mapper;

import java.util.List;

@Mapper(componentModel = "spring")
public interface AddressMapper {
    
    AddressResponse toDto(Address address);
    
    List<AddressResponse> toDtoList(List<Address> addresses);
}

