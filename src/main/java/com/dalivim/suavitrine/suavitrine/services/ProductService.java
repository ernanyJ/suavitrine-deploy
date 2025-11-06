package com.dalivim.suavitrine.suavitrine.services;

import com.dalivim.suavitrine.suavitrine.dtos.*;
import com.dalivim.suavitrine.suavitrine.entities.*;
import com.dalivim.suavitrine.suavitrine.mappers.*;
import com.dalivim.suavitrine.suavitrine.infra.exceptions.IllegalUserArgumentException;
import com.dalivim.suavitrine.suavitrine.infra.exceptions.InsufficientPermissionException;
import com.dalivim.suavitrine.suavitrine.infra.exceptions.ObjectNotFoundException;
import com.dalivim.suavitrine.suavitrine.infra.security.JwtService;
import com.dalivim.suavitrine.suavitrine.repositories.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class ProductService {

    private final ProductRepository productRepository;
    private final CategoryRepository categoryRepository;
    private final StoreRepository storeRepository;
    private final StoreUserRepository storeUserRepository;
    private final ProductVariationRepository productVariationRepository;
    private final ProductImageRepository productImageRepository;
    private final ImageService imageService;
    private final JwtService jwtService;
    private final ProductMapper productMapper;
    private final ProductResponseMapper productResponseMapper;
    private final ProductVariationMapper productVariationMapper;

    @Transactional
    public ProductResponse createProduct(CreateProductRequest request) {
        // Converte o DTO para Entity usando MapStruct
        Product product = productMapper.toEntity(request);
        
        // Converte variações se fornecidas
        List<ProductVariation> variations = null;
        if (request.variations() != null && !request.variations().isEmpty()) {
            variations = productVariationMapper.toEntityList(request.variations());
        }

        // Chama o método que trabalha com entidades
        Product createdProduct = createProduct(
                product, 
                request.storeId(), 
                request.categoryId(),
                request.images(),
                variations
        );
        
        // Converte para DTO de resposta
        return productResponseMapper.toDto(createdProduct);
    }

    @Transactional
    public Product createProduct(Product product, UUID storeId, UUID categoryId, List<ProductImageRequest> imageRequests, List<ProductVariation> variations) {
        Store store = storeRepository.findById(storeId)
                .orElseThrow(() -> new ObjectNotFoundException("Loja não encontrada"));

        if (store.getDeletedAt() != null) {
            throw new IllegalUserArgumentException("Loja foi deletada");
        }

        if (!userHasPermissionToEditStore(store)) {
            throw new InsufficientPermissionException("Usuário não tem permissão para criar produtos nesta loja.");
        }

        product.setStore(store);

        // Define available como true por padrão se não fornecido
        if (product.getAvailable() == null) {
            product.setAvailable(true);
        }

        // Define a categoria se fornecida
        if (categoryId != null) {
            Category category = categoryRepository.findById(categoryId)
                    .orElseThrow(() -> new ObjectNotFoundException("Categoria não encontrada"));

            if (category.getDeletedAt() != null) {
                throw new IllegalUserArgumentException("Categoria foi deletada");
            }

            if (!category.getStore().getId().equals(storeId)) {
                throw new IllegalUserArgumentException("Categoria não pertence à loja especificada");
            }

            product.setCategory(category);
        }

        // Salva o produto primeiro
        Product savedProduct = productRepository.save(product);

        // Adiciona as imagens se fornecidas
        if (imageRequests != null && !imageRequests.isEmpty()) {
            validateImageCount(imageRequests);
            
            // Faz upload das imagens para o storage (retorna as KEYS)
            List<String> uploadedKeys = new ArrayList<>();
            for (ProductImageRequest imageRequest : imageRequests) {
                String key = imageService.uploadBase64Image(
                    imageRequest.base64Image(),
                    imageRequest.fileName(),
                    imageRequest.contentType()
                );
                uploadedKeys.add(key);
            }
            
            // Cria as entidades ProductImage com as KEYS (não URLs)
            List<ProductImage> savedImages = new ArrayList<>();
            for (int i = 0; i < uploadedKeys.size(); i++) {
                ProductImage image = new ProductImage();
                image.setUrl(uploadedKeys.get(i)); // Store the KEY, not URL
                image.setDisplayOrder(imageRequests.get(i).displayOrder() != null ? imageRequests.get(i).displayOrder() : i);
                image.setProduct(savedProduct);
                savedImages.add(productImageRepository.save(image));
            }
            savedProduct.setImages(savedImages);
        }

        // Adiciona as variações se fornecidas
        if (variations != null && !variations.isEmpty()) {
            List<ProductVariation> savedVariations = new ArrayList<>();
            for (ProductVariation variation : variations) {
                variation.setProduct(savedProduct);
                savedVariations.add(productVariationRepository.save(variation));
            }
            savedProduct.setVariations(savedVariations);
        }

        return savedProduct;
    }

    @Transactional
    public ProductResponse updateProduct(UUID productId, UpdateProductRequest request) {
        // Busca o produto existente
        Product existingProduct = productRepository.findById(productId)
                .orElseThrow(() -> new ObjectNotFoundException("Produto não encontrado"));

        if (existingProduct.getDeletedAt() != null) {
            throw new IllegalUserArgumentException("Produto foi deletado e não pode ser atualizado");
        }

        if (!userHasPermissionToEditStore(existingProduct.getStore())) {
            throw new InsufficientPermissionException("Usuário não tem permissão para atualizar este produto.");
        }
        
        // Atualiza a entidade com os dados do DTO usando MapStruct
        productMapper.updateEntityFromDto(request, existingProduct);
        
        // Converte variações se fornecidas
        List<ProductVariation> variations = null;
        if (request.variations() != null && !request.variations().isEmpty()) {
            variations = productVariationMapper.toEntityList(request.variations());
        }

        // Chama o método que trabalha com entidades
        Product updatedProduct = updateProduct(
                productId, 
                existingProduct, 
                request.categoryId(),
                request.images(),
                variations
        );
        
        // Converte para DTO de resposta
        return productResponseMapper.toDto(updatedProduct);
    }

    /**
     * Atualiza um produto existente (método que trabalha com entidades)
     */
    @Transactional
    public Product updateProduct(UUID productId, Product updatedProduct, UUID categoryId, List<ProductImageRequest> newImageRequests, List<ProductVariation> newVariations) {
        Product existingProduct = productRepository.findById(productId)
                .orElseThrow(() -> new ObjectNotFoundException("Produto não encontrado"));

        if (existingProduct.getDeletedAt() != null) {
            throw new IllegalUserArgumentException("Produto foi deletado e não pode ser atualizado");
        }

        if (!userHasPermissionToEditStore(existingProduct.getStore())) {
            throw new InsufficientPermissionException("Usuário não tem permissão para atualizar este produto.");
        }

        // Atualiza os campos básicos do produto existente com os valores do produto atualizado

        // Atualiza os campos básicos
        if (updatedProduct.getTitle() != null) {
            existingProduct.setTitle(updatedProduct.getTitle());
        }
        if (updatedProduct.getPrice() != null) {
            existingProduct.setPrice(updatedProduct.getPrice());
        }
        if (updatedProduct.getPromotionalPrice() != null) {
            existingProduct.setPromotionalPrice(updatedProduct.getPromotionalPrice());
        }
        if (updatedProduct.getShowPromotionBadge() != null) {
            existingProduct.setShowPromotionBadge(updatedProduct.getShowPromotionBadge());
        }
        if (updatedProduct.getDescription() != null) {
            existingProduct.setDescription(updatedProduct.getDescription());
        }
        if (updatedProduct.getDisplayOrder() != null) {
            existingProduct.setDisplayOrder(updatedProduct.getDisplayOrder());
        }
        if (updatedProduct.getAvailable() != null) {
            existingProduct.setAvailable(updatedProduct.getAvailable());
        }

        // Atualiza a categoria se fornecida
        if (categoryId != null) {
            Category category = categoryRepository.findById(categoryId)
                    .orElseThrow(() -> new ObjectNotFoundException("Categoria não encontrada"));

            if (category.getDeletedAt() != null) {
                throw new IllegalUserArgumentException("Categoria foi deletada");
            }

            if (!category.getStore().getId().equals(existingProduct.getStore().getId())) {
                throw new IllegalUserArgumentException("Categoria não pertence à mesma loja do produto");
            }

            existingProduct.setCategory(category);
        }

        // Atualiza as imagens se fornecidas
        if (newImageRequests != null) {
            validateImageCount(newImageRequests);
            
            // Remove imagens antigas (soft delete e delete do storage)
            List<ProductImage> oldImages = productImageRepository.findByProductAndDeletedAtIsNull(existingProduct);
            for (ProductImage oldImage : oldImages) {
                // Delete a imagem antiga do storage
                imageService.deleteImage(oldImage.getUrl());
                oldImage.setDeletedAt(Instant.now());
                productImageRepository.save(oldImage);
            }

            // Faz upload das novas imagens para o storage (retorna KEYS)
            List<String> uploadedKeys = new ArrayList<>();
            for (ProductImageRequest imageRequest : newImageRequests) {
                String key = imageService.uploadBase64Image(
                    imageRequest.base64Image(),
                    imageRequest.fileName(),
                    imageRequest.contentType()
                );
                uploadedKeys.add(key);
            }

            // Cria as entidades ProductImage com as KEYS (não URLs)
            List<ProductImage> savedImages = new ArrayList<>();
            for (int i = 0; i < uploadedKeys.size(); i++) {
                ProductImage image = new ProductImage();
                image.setUrl(uploadedKeys.get(i)); // Store the KEY
                image.setDisplayOrder(newImageRequests.get(i).displayOrder() != null ? newImageRequests.get(i).displayOrder() : i);
                image.setProduct(existingProduct);
                savedImages.add(productImageRepository.save(image));
            }
            existingProduct.setImages(savedImages);
        }

        // Atualiza as variações se fornecidas
        if (newVariations != null) {
            // Remove variações antigas (soft delete)
            List<ProductVariation> oldVariations = productVariationRepository.findByProductAndDeletedAtIsNull(existingProduct);
            for (ProductVariation oldVariation : oldVariations) {
                oldVariation.setDeletedAt(Instant.now());
                productVariationRepository.save(oldVariation);
            }

            // Adiciona novas variações
            List<ProductVariation> savedVariations = new ArrayList<>();
            for (ProductVariation variation : newVariations) {
                variation.setProduct(existingProduct);
                savedVariations.add(productVariationRepository.save(variation));
            }
            existingProduct.setVariations(savedVariations);
        }

        return productRepository.save(existingProduct);
    }

    /**
     * Remove um produto (soft delete)
     */
    @Transactional
    public void deleteProduct(UUID productId) {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new ObjectNotFoundException("Produto não encontrado"));

        if (product.getDeletedAt() != null) {
            throw new IllegalUserArgumentException("Produto já foi deletado");
        }

        if (!userHasPermissionToEditStore(product.getStore())) {
            throw new InsufficientPermissionException("Usuário não tem permissão para deletar este produto.");
        }

        // Soft delete das imagens também e delete do storage
        List<ProductImage> images = productImageRepository.findByProductAndDeletedAtIsNull(product);
        for (ProductImage image : images) {
            // Delete a imagem do storage
            imageService.deleteImage(image.getUrl());
            image.setDeletedAt(Instant.now());
            productImageRepository.save(image);
        }

        // Soft delete das variações também
        List<ProductVariation> variations = productVariationRepository.findByProductAndDeletedAtIsNull(product);
        for (ProductVariation variation : variations) {
            variation.setDeletedAt(Instant.now());
            productVariationRepository.save(variation);
        }

        product.setDeletedAt(Instant.now());
        productRepository.save(product);
    }

    public ProductResponse getProductById(UUID productId) {
        Product product = getProductByIdEntity(productId);
        return productResponseMapper.toDto(product);
    }

    public Product getProductByIdEntity(UUID productId) {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new ObjectNotFoundException("Produto não encontrado"));

        if (product.getDeletedAt() != null) {
            throw new IllegalUserArgumentException("Produto foi deletado");
        }

        return product;
    }


    public List<ProductResponse> getProductsByStore(UUID storeId) {
        List<Product> products = getProductsByStoreEntity(storeId);
        return productResponseMapper.toDtoList(products);
    }


    public List<Product> getProductsByStoreEntity(UUID storeId) {
        Store store = storeRepository.findById(storeId)
                .orElseThrow(() -> new ObjectNotFoundException("Loja não encontrada"));

        return productRepository.findByStoreAndDeletedAtIsNull(store);
    }


    public List<ProductResponse> getProductsByCategory(UUID categoryId) {
        List<Product> products = getProductsByCategoryEntity(categoryId);
        return productResponseMapper.toDtoList(products);
    }


    public List<Product> getProductsByCategoryEntity(UUID categoryId) {
        Category category = categoryRepository.findById(categoryId)
                .orElseThrow(() -> new ObjectNotFoundException("Categoria não encontrada"));

        if (category.getDeletedAt() != null) {
            throw new IllegalUserArgumentException("Categoria foi deletada");
        }

        return productRepository.findByCategoryAndDeletedAtIsNullOrderByDisplayOrder(category);
    }

    private boolean userHasPermissionToEditStore(Store store) {
        var storeUsers = storeUserRepository.findByStore(store);
        var currentUser = jwtService.getCurrentAuthenticatedUser();

        return storeUsers.stream()
                .anyMatch(su -> su.getUser().getId().equals(currentUser.getId()) &&
                        (su.getRole() == UserRole.OWNER || su.getRole() == UserRole.MANAGER) &&
                        su.getDeletedAt() == null);
    }

    @Transactional
    public void updateProductsOrder(UUID categoryId, List<UUID> productIds) {
        Category category = categoryRepository.findById(categoryId)
                .orElseThrow(() -> new ObjectNotFoundException("Categoria não encontrada"));

        if (category.getDeletedAt() != null) {
            throw new IllegalUserArgumentException("Categoria foi deletada");
        }

        if (!userHasPermissionToEditStore(category.getStore())) {
            throw new InsufficientPermissionException("Usuário não tem permissão para atualizar a ordem dos produtos desta categoria.");
        }

        // Busca todos os produtos da categoria para validar se pertencem à categoria
        List<Product> categoryProducts = productRepository.findByCategoryAndDeletedAtIsNull(category);
        List<UUID> validProductIds = categoryProducts.stream()
                .map(Product::getId)
                .toList();

        // Valida se todos os produtos fornecidos pertencem à categoria
        for (UUID productId : productIds) {
            if (!validProductIds.contains(productId)) {
                throw new IllegalUserArgumentException("Produto com ID " + productId + " não pertence à categoria especificada");
            }
        }

        // Atualiza a ordem dos produtos
        for (int i = 0; i < productIds.size(); i++) {
            Product product = productRepository.findById(productIds.get(i))
                    .orElseThrow(() -> new ObjectNotFoundException("Produto não encontrado"));
            product.setDisplayOrder(i + 1); // Ordem começa em 1
            productRepository.save(product);
        }
    }

    private void validateImageCount(List<ProductImageRequest> images) {
        if (images.size() > 5) {
            throw new IllegalUserArgumentException("Um produto pode ter no máximo 5 imagens");
        }
    }

    /**
     * Alterna a disponibilidade de um produto
     */
    @Transactional
    public ProductResponse toggleAvailability(UUID productId) {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new ObjectNotFoundException("Produto não encontrado"));

        if (product.getDeletedAt() != null) {
            throw new IllegalUserArgumentException("Produto foi deletado");
        }

        if (!userHasPermissionToEditStore(product.getStore())) {
            throw new InsufficientPermissionException("Usuário não tem permissão para alterar a disponibilidade deste produto.");
        }

        // Alterna o valor de available (se null, considera como false)
        product.setAvailable(product.getAvailable() == null || !product.getAvailable());
        Product updatedProduct = productRepository.save(product);

        return productResponseMapper.toDto(updatedProduct);
    }
}

