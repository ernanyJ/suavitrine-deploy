package com.dalivim.suavitrine.suavitrine.dtos;

import com.dalivim.suavitrine.suavitrine.entities.BackgroundType;
import com.dalivim.suavitrine.suavitrine.entities.RoundedLevel;
import com.dalivim.suavitrine.suavitrine.entities.ThemeMode;

public record UpdateThemeConfigRequest(
        String name,
        String description,
        String primaryColor,
        ThemeMode themeMode,
        String primaryFont,
        String secondaryFont,
        RoundedLevel roundedLevel,
        String productCardShadow,
        BannerImageRequest logo,
        BannerImageRequest bannerDesktop,
        BannerImageRequest bannerTablet,
        BannerImageRequest bannerMobile,
        BackgroundType backgroundType,
        Boolean backgroundEnabled,
        Double backgroundOpacity,
        String backgroundColor,
        String backgroundConfigJson
) {
}

