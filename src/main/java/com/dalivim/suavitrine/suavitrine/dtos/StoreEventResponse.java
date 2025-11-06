package com.dalivim.suavitrine.suavitrine.dtos;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;
import java.util.UUID;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class StoreEventResponse {
    private UUID id;
    private UUID storeId;
    private String eventType;
    private UUID entityId;
    private String entityType;
    private String metadata;
    private Instant createdAt;
}
