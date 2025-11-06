package com.dalivim.suavitrine.suavitrine.repositories;

import com.dalivim.suavitrine.suavitrine.entities.Store;
import com.dalivim.suavitrine.suavitrine.entities.StoreUser;
import com.dalivim.suavitrine.suavitrine.entities.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface StoreUserRepository extends JpaRepository<StoreUser, UUID> {
    List<StoreUser> findByStore(Store store);
    List<StoreUser> findByUser(User user);
    Optional<StoreUser> findByStoreAndUser(Store store, User user);
    boolean existsByStoreAndUser(Store store, User user);
}

