//package com.dalivim.suavitrine.suavitrine.mappers;
//
//import com.dalivim.suavitrine.suavitrine.dtos.AddressResponse;
//import com.dalivim.suavitrine.suavitrine.dtos.StoreResponse;
//import com.dalivim.suavitrine.suavitrine.entities.Address;
//import com.dalivim.suavitrine.suavitrine.entities.RoundedLevel;
//import com.dalivim.suavitrine.suavitrine.entities.Store;
//import com.dalivim.suavitrine.suavitrine.entities.ThemeMode;
//import com.dalivim.suavitrine.suavitrine.services.ImageService;
//import lombok.RequiredArgsConstructor;
//import org.springframework.stereotype.Service;
//
//import java.time.Instant;
//import java.util.List;
//import java.util.UUID;
//
//@Service
//@RequiredArgsConstructor
//public class StoreResponseMapperImpl implements StoreResponseMapper {
//
//    private final ImageService imageService;
//    private final AddressMapper addressMapper;
//
//    @Override
//    public StoreResponse toDto(Store store) {
//        // Converte bannerUrl (KEY) para presigned URL se existir
//        String bannerUrl = null;
//        if (store.getBannerUrl() != null && !store.getBannerUrl().isEmpty()) {
//            bannerUrl = imageService.getPresignedUrl(store.getBannerUrl());
//        }
//
//        return new StoreResponse(
//                store.getId(),
//                store.getName(),
//                store.getSlug(),
//                store.getAddress() != null ? addressMapper.toDto(store.getAddress()) : null,
//                store.getPhoneNumber(),
//                store.getEmail(),
//                store.getInstagram(),
//                store.getFacebook(),
//                store.getPrimaryColor(),
//                store.getThemeMode(),
//                store.getPrimaryFont(),
//                store.getSecondaryFont(),
//                store.getRoundedLevel(),
//                bannerUrl,
//                store.getCreatedAt(),
//                store.getUpdatedAt()
//        );
//    }
//
//    @Override
//    public List<StoreResponse> toDtoList(List<Store> stores) {
//        if (stores == null) {
//            return List.of();
//        }
//        return stores.stream()
//                .map(this::toDto)
//                .toList();
//    }
//}
//
