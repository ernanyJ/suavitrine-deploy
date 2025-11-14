package com.dalivim.suavitrine.suavitrine.dtos;

import com.dalivim.suavitrine.suavitrine.entities.billing.PayingPlan;
import com.dalivim.suavitrine.suavitrine.entities.billing.PlanDuration;

public record CreateBillingRequest(
        PayingPlan payingPlan,
        PlanDuration planDuration,
        String taxId
) {
}




