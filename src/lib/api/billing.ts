import { apiClient } from './axios-config';

export type PayingPlan = 'FREE' | 'BASIC' | 'PRO';
export type PlanDuration = 'MONTHLY' | 'YEARLY';

export interface CreateBillingRequest {
  payingPlan: PayingPlan;
  planDuration: PlanDuration;
}

export interface BillingResponse {
  id: string;
  paymentUrl: string;
  price: number;
  payingPlan: PayingPlan;
  planDuration: PlanDuration;
  expiresAt: string;
  externalId: string;
}

export const billingApi = {
  /**
   * Create a new billing request for a store
   */
  async createBillingRequest(
    storeId: string,
    request: CreateBillingRequest
  ): Promise<BillingResponse> {
    const response = await apiClient.post<BillingResponse>(
      `/api/v1/billing/${storeId}`,
      request
    );
    return response.data;
  },
};

