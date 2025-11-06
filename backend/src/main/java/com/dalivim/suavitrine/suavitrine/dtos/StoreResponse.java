package com.dalivim.suavitrine.suavitrine.dtos;

import com.dalivim.suavitrine.suavitrine.entities.BackgroundType;
import com.dalivim.suavitrine.suavitrine.entities.RoundedLevel;
import com.dalivim.suavitrine.suavitrine.entities.ThemeMode;
import com.dalivim.suavitrine.suavitrine.entities.billing.PayingPlan;

import java.time.Instant;
import java.util.UUID;

public record StoreResponse(
        UUID id,
        String name,
        String description,
        String slug,
        AddressResponse address,
        String phoneNumber,
        String email,
        String instagram,
        String facebook,
        String logoUrl,
        String primaryColor,
        ThemeMode themeMode,
        String primaryFont,
        String secondaryFont,
        RoundedLevel roundedLevel,
        String productCardShadow,
        String bannerDesktopUrl,
        String bannerTabletUrl,
        String bannerMobileUrl,
        BackgroundType backgroundType,
        Boolean backgroundEnabled,
        Double backgroundOpacity,
        String backgroundColor,
        String backgroundConfigJson,
        PayingPlan activePlan,
        Instant createdAt,
        Instant updatedAt
) {
}

