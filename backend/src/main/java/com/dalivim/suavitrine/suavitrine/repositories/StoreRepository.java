package com.dalivim.suavitrine.suavitrine.repositories;

import com.dalivim.suavitrine.suavitrine.entities.Store;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface StoreRepository extends JpaRepository<Store, UUID> {
    Optional<Store> findByEmail(String email);
    boolean existsByEmail(String email);
    Optional<Store> findBySlug(String slug);
    boolean existsBySlug(String slug);
}

