package com.dalivim.suavitrine.suavitrine.repositories;

import com.dalivim.suavitrine.suavitrine.entities.Product;
import com.dalivim.suavitrine.suavitrine.entities.ProductImage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface ProductImageRepository extends JpaRepository<ProductImage, UUID> {
    List<ProductImage> findByProductAndDeletedAtIsNull(Product product);
}



