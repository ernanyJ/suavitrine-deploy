package com.dalivim.suavitrine.suavitrine.dtos;

import com.dalivim.suavitrine.suavitrine.entities.BackgroundType;

public record UpdateBackgroundRequest(
        BackgroundType backgroundType,
        Boolean backgroundEnabled,
        Double backgroundOpacity,
        String backgroundColor,
        String backgroundConfigJson
) {
}

