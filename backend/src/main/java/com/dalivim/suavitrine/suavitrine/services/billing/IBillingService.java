package com.dalivim.suavitrine.suavitrine.services.billing;

import java.util.UUID;

import com.dalivim.suavitrine.suavitrine.dtos.BillingResponse;
import com.dalivim.suavitrine.suavitrine.entities.billing.PayingPlan;
import com.dalivim.suavitrine.suavitrine.entities.billing.PlanDuration;

public interface IBillingService {
    BillingResponse createBillingRequest(UUID storeId, PayingPlan payingPlan, PlanDuration planDuration);
}
