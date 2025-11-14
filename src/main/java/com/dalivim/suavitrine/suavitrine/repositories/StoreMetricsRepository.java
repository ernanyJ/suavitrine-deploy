package com.dalivim.suavitrine.suavitrine.repositories;

import com.dalivim.suavitrine.suavitrine.entities.StoreMetrics;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface StoreMetricsRepository extends JpaRepository<StoreMetrics, UUID> {

    @Query("SELECT sm FROM StoreMetrics sm WHERE sm.store.id = :storeId AND sm.date >= :startDate AND sm.date <= :endDate ORDER BY sm.date ASC")
    List<StoreMetrics> findByStoreIdAndDateRange(@Param("storeId") UUID storeId,
                                                @Param("startDate") LocalDate startDate,
                                                @Param("endDate") LocalDate endDate);

    @Query("SELECT sm FROM StoreMetrics sm WHERE sm.store.id = :storeId AND sm.date = :date")
    Optional<StoreMetrics> findByStoreIdAndDate(@Param("storeId") UUID storeId, @Param("date") LocalDate date);

    @Query("SELECT SUM(sm.dailyAccesses) FROM StoreMetrics sm WHERE sm.store.id = :storeId AND sm.date >= :startDate AND sm.date <= :endDate")
    Long getTotalAccessesByStoreIdAndDateRange(@Param("storeId") UUID storeId,
                                              @Param("startDate") LocalDate startDate,
                                              @Param("endDate") LocalDate endDate);

    @Query("SELECT SUM(sm.productClicks) FROM StoreMetrics sm WHERE sm.store.id = :storeId AND sm.date >= :startDate AND sm.date <= :endDate")
    Long getTotalProductClicksByStoreIdAndDateRange(@Param("storeId") UUID storeId,
                                                   @Param("startDate") LocalDate startDate,
                                                   @Param("endDate") LocalDate endDate);

    @Query("SELECT SUM(sm.productConversions) FROM StoreMetrics sm WHERE sm.store.id = :storeId AND sm.date >= :startDate AND sm.date <= :endDate")
    Long getTotalProductConversionsByStoreIdAndDateRange(@Param("storeId") UUID storeId,
                                                        @Param("startDate") LocalDate startDate,
                                                        @Param("endDate") LocalDate endDate);

    @Query("SELECT SUM(sm.categoryClicks) FROM StoreMetrics sm WHERE sm.store.id = :storeId AND sm.date >= :startDate AND sm.date <= :endDate")
    Long getTotalCategoryClicksByStoreIdAndDateRange(@Param("storeId") UUID storeId,
                                                    @Param("startDate") LocalDate startDate,
                                                    @Param("endDate") LocalDate endDate);

    @Query("SELECT SUM(sm.categoryAccesses) FROM StoreMetrics sm WHERE sm.store.id = :storeId AND sm.date >= :startDate AND sm.date <= :endDate")
    Long getTotalCategoryAccessesByStoreIdAndDateRange(@Param("storeId") UUID storeId,
                                                      @Param("startDate") LocalDate startDate,
                                                      @Param("endDate") LocalDate endDate);
}
