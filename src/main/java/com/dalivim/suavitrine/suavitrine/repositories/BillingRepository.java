package com.dalivim.suavitrine.suavitrine.repositories;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

import com.dalivim.suavitrine.suavitrine.entities.Store;
import com.dalivim.suavitrine.suavitrine.entities.billing.Billing;

@Repository
public interface BillingRepository extends JpaRepository<Billing, UUID> {
    List<Billing> findByStore(Store store);

    @Query("SELECT b FROM Billing b WHERE b.store = :store AND b.paidAt IS NOT NULL AND (b.expiresAt IS NULL OR CURRENT_TIMESTAMP < b.expiresAt)")
    Optional<Billing> findCurrentActivePlan(Store store);

    Optional<Billing> findByExternalId(String externalId);

}
