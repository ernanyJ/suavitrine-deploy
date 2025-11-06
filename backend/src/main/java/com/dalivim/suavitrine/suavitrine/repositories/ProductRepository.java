package com.dalivim.suavitrine.suavitrine.repositories;

import com.dalivim.suavitrine.suavitrine.entities.Category;
import com.dalivim.suavitrine.suavitrine.entities.Product;
import com.dalivim.suavitrine.suavitrine.entities.Store;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface ProductRepository extends JpaRepository<Product, UUID> {
    
    /**
     * Busca produtos da loja ordenados por displayOrder (valores menores primeiro)
     * Produtos sem displayOrder aparecem por último
     */
    @Query("SELECT p FROM Product p WHERE p.store = :store AND p.deletedAt IS NULL " +
           "ORDER BY CASE WHEN p.displayOrder IS NULL THEN 1 ELSE 0 END, p.displayOrder ASC")
    List<Product> findByStoreAndDeletedAtIsNull(Store store);
    
    /**
     * Busca produtos de uma categoria ordenados por displayOrder (valores menores primeiro)
     * Produtos sem displayOrder aparecem por último
     */
    @Query("SELECT p FROM Product p WHERE p.category = :category AND p.deletedAt IS NULL " +
           "ORDER BY CASE WHEN p.displayOrder IS NULL THEN 1 ELSE 0 END, p.displayOrder ASC")
    List<Product> findByCategoryAndDeletedAtIsNullOrderByDisplayOrder(Category category);
    
    /**
     * Método original mantido para compatibilidade
     */
    List<Product> findByCategoryAndDeletedAtIsNull(Category category);
    
    /**
     * Busca produtos disponíveis da loja ordenados por displayOrder (valores menores primeiro)
     * Produtos sem displayOrder aparecem por último
     * Usado para endpoints públicos que não devem retornar produtos indisponíveis
     */
    @Query("SELECT p FROM Product p WHERE p.store = :store AND p.deletedAt IS NULL AND (p.available IS NULL OR p.available = true) " +
           "ORDER BY CASE WHEN p.displayOrder IS NULL THEN 1 ELSE 0 END, p.displayOrder ASC")
    List<Product> findByStoreAndDeletedAtIsNullAndAvailableTrue(Store store);
    
    /**
     * Busca produtos disponíveis de uma categoria ordenados por displayOrder (valores menores primeiro)
     * Produtos sem displayOrder aparecem por último
     * Usado para endpoints públicos que não devem retornar produtos indisponíveis
     */
    @Query("SELECT p FROM Product p WHERE p.category = :category AND p.deletedAt IS NULL AND (p.available IS NULL OR p.available = true) " +
           "ORDER BY CASE WHEN p.displayOrder IS NULL THEN 1 ELSE 0 END, p.displayOrder ASC")
    List<Product> findByCategoryAndDeletedAtIsNullAndAvailableTrueOrderByDisplayOrder(Category category);
}

