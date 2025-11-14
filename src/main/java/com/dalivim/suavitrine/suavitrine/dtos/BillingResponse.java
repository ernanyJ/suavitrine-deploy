package com.dalivim.suavitrine.suavitrine.dtos;

import java.time.Instant;
import java.util.UUID;

import com.dalivim.suavitrine.suavitrine.entities.billing.PayingPlan;
import com.dalivim.suavitrine.suavitrine.entities.billing.PlanDuration;

public record BillingResponse(
        UUID id,
        String paymentUrl,
        int price,
        PayingPlan payingPlan,
        PlanDuration planDuration,
        Instant expiresAt,
        String externalId
) {
}

