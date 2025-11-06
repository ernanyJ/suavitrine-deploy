package com.dalivim.suavitrine.suavitrine.repositories;

import com.dalivim.suavitrine.suavitrine.entities.StoreEvent;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

@Repository
public interface StoreEventRepository extends JpaRepository<StoreEvent, UUID> {

    @Query("""
        SELECT se 
        FROM StoreEvent se 
        WHERE se.store.id = :storeId 
          AND se.createdAt >= :startDate 
          AND se.createdAt <= :endDate 
        ORDER BY se.createdAt DESC
    """)
    List<StoreEvent> findByStoreIdAndDateRange(@Param("storeId") UUID storeId,
                                               @Param("startDate") Instant startDate,
                                               @Param("endDate") Instant endDate);

    @Query("""
        SELECT se 
        FROM StoreEvent se 
        WHERE se.store.id = :storeId 
          AND se.eventType = :eventType 
          AND se.createdAt >= :startDate 
          AND se.createdAt <= :endDate
    """)
    List<StoreEvent> findByStoreIdAndEventTypeAndDateRange(@Param("storeId") UUID storeId,
                                                           @Param("eventType") StoreEvent.EventType eventType,
                                                           @Param("startDate") Instant startDate,
                                                           @Param("endDate") Instant endDate);

    @Query("""
        SELECT COUNT(se) 
        FROM StoreEvent se 
        WHERE se.store.id = :storeId 
          AND se.eventType = :eventType 
          AND (:entityId IS NULL OR se.entityId = :entityId)
          AND se.createdAt >= :startDate 
          AND se.createdAt <= :endDate
    """)
    Long countByStoreIdAndEventTypeAndEntityIdAndDateRange(@Param("storeId") UUID storeId,
                                                           @Param("eventType") StoreEvent.EventType eventType,
                                                           @Param("entityId") UUID entityId,
                                                           @Param("startDate") Instant startDate,
                                                           @Param("endDate") Instant endDate);

    @Query("""
        SELECT se.entityId, COUNT(se) as count 
        FROM StoreEvent se 
        WHERE se.store.id = :storeId 
          AND se.eventType = :eventType 
          AND se.createdAt >= :startDate 
          AND se.createdAt <= :endDate 
        GROUP BY se.entityId 
        ORDER BY count DESC
    """)
    List<Object[]> findTopEntitiesByEventTypeAndDateRange(@Param("storeId") UUID storeId,
                                                          @Param("eventType") StoreEvent.EventType eventType,
                                                          @Param("startDate") Instant startDate,
                                                          @Param("endDate") Instant endDate);
}
