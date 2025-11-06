package com.dalivim.suavitrine.suavitrine.mappers;

import com.dalivim.suavitrine.suavitrine.dtos.CreateStoreRequest;
import com.dalivim.suavitrine.suavitrine.dtos.UpdateStoreRequest;
import com.dalivim.suavitrine.suavitrine.dtos.UpdateThemeConfigRequest;
import com.dalivim.suavitrine.suavitrine.entities.Store;
import org.mapstruct.*;

@Mapper(componentModel = "spring")
public interface StoreMapper {

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "slug", ignore = true)
    @Mapping(target = "storeUsers", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    @Mapping(target = "deletedAt", ignore = true)
    @Mapping(target = "primaryColor", ignore = true)
    @Mapping(target = "themeMode", ignore = true)
    @Mapping(target = "primaryFont", ignore = true)
    @Mapping(target = "secondaryFont", ignore = true)
    @Mapping(target = "roundedLevel", ignore = true)
    @Mapping(target = "productCardShadow", ignore = true)
    @Mapping(target = "logoUrl", ignore = true)
    @Mapping(target = "bannerDesktopUrl", ignore = true)
    @Mapping(target = "bannerTabletUrl", ignore = true)
    @Mapping(target = "bannerMobileUrl", ignore = true)
    @Mapping(target = "address.id", ignore = true)
    @Mapping(target = "address.street", source = "street")
    @Mapping(target = "address.city", source = "city")
    @Mapping(target = "address.state", source = "state")
    @Mapping(target = "address.zipCode", source = "zipCode")
    Store toEntity(CreateStoreRequest request);

    @BeanMapping(nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "slug", ignore = true)
    @Mapping(target = "storeUsers", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    @Mapping(target = "deletedAt", ignore = true)
    @Mapping(target = "primaryColor", ignore = true)
    @Mapping(target = "themeMode", ignore = true)
    @Mapping(target = "primaryFont", ignore = true)
    @Mapping(target = "secondaryFont", ignore = true)
    @Mapping(target = "roundedLevel", ignore = true)
    @Mapping(target = "productCardShadow", ignore = true)
    @Mapping(target = "logoUrl", ignore = true)
    @Mapping(target = "bannerDesktopUrl", ignore = true)
    @Mapping(target = "bannerTabletUrl", ignore = true)
    @Mapping(target = "bannerMobileUrl", ignore = true)
    @Mapping(target = "address.id", ignore = true)
    @Mapping(target = "address.street", source = "street")
    @Mapping(target = "address.city", source = "city")
    @Mapping(target = "address.state", source = "state")
    @Mapping(target = "address.zipCode", source = "zipCode")
    void updateEntityFromDto(UpdateStoreRequest request, @MappingTarget Store store);

    @BeanMapping(nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "storeUsers", ignore = true)
    @Mapping(target = "slug", ignore = true)
    @Mapping(target = "address", ignore = true)
    @Mapping(target = "phoneNumber", ignore = true)
    @Mapping(target = "email", ignore = true)
    @Mapping(target = "instagram", ignore = true)
    @Mapping(target = "facebook", ignore = true)
    @Mapping(target = "logoUrl", ignore = true)
    @Mapping(target = "bannerDesktopUrl", ignore = true)
    @Mapping(target = "bannerTabletUrl", ignore = true)
    @Mapping(target = "bannerMobileUrl", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    @Mapping(target = "deletedAt", ignore = true)
    @Mapping(target = "storeEvents", ignore = true)
    @Mapping(target = "storeMetrics", ignore = true)
    void updateThemeConfigFromDto(UpdateThemeConfigRequest request, @MappingTarget Store store);
}

