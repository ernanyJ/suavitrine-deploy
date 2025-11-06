package com.dalivim.suavitrine.suavitrine.mappers;

import com.dalivim.suavitrine.suavitrine.dtos.UserResponse;
import com.dalivim.suavitrine.suavitrine.entities.User;
import org.mapstruct.Mapper;

import java.util.List;

@Mapper(componentModel = "spring")
public interface UserResponseMapper {
    
    UserResponse toDto(User user);
    
    List<UserResponse> toDtoList(List<User> users);
}

