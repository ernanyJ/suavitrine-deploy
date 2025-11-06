package com.dalivim.suavitrine.suavitrine.services;

import com.dalivim.suavitrine.suavitrine.dtos.*;
import com.dalivim.suavitrine.suavitrine.entities.Category;
import com.dalivim.suavitrine.suavitrine.mappers.*;
import com.dalivim.suavitrine.suavitrine.entities.Store;
import com.dalivim.suavitrine.suavitrine.entities.UserRole;
import com.dalivim.suavitrine.suavitrine.infra.exceptions.IllegalUserArgumentException;
import com.dalivim.suavitrine.suavitrine.infra.exceptions.InsufficientPermissionException;
import com.dalivim.suavitrine.suavitrine.infra.exceptions.ObjectNotFoundException;
import com.dalivim.suavitrine.suavitrine.infra.security.JwtService;
import com.dalivim.suavitrine.suavitrine.repositories.CategoryRepository;
import com.dalivim.suavitrine.suavitrine.repositories.StoreRepository;
import com.dalivim.suavitrine.suavitrine.repositories.StoreUserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class CategoryService {

    private final CategoryRepository categoryRepository;
    private final StoreRepository storeRepository;
    private final StoreUserRepository storeUserRepository;
    private final ImageService imageService;
    private final JwtService jwtService;
    private final CategoryMapper categoryMapper;
    private final CategoryResponseMapper categoryResponseMapper;

    /**
     * Cria uma nova categoria (método que recebe DTO)
     */
    @Transactional
    public CategoryResponse createCategory(CreateCategoryRequest request) {
        // Converte o DTO para Entity usando MapStruct
        Category category = categoryMapper.toEntity(request);
        
        // Chama o método que trabalha com entidades
        Category createdCategory = createCategory(category, request.storeId(), request.image());
        
        // Converte para DTO de resposta
        return toCategoryResponse(createdCategory);
    }

    /**
     * Cria uma nova categoria (método que trabalha com entidades)
     */
    @Transactional
    public Category createCategory(Category category, UUID storeId, CategoryImageRequest imageRequest) {
        Store store = storeRepository.findById(storeId)
                .orElseThrow(() -> new ObjectNotFoundException("Loja não encontrada"));

        if (store.getDeletedAt() != null) {
            throw new IllegalUserArgumentException("Loja foi deletada");
        }

        if (!userHasPermissionToEditStore(store)) {
            throw new InsufficientPermissionException("Usuário não tem permissão para criar categorias nesta loja.");
        }

        category.setStore(store);

        // Faz upload da imagem se fornecida
        if (imageRequest != null) {
            String key = imageService.uploadBase64Image(
                imageRequest.base64Image(),
                imageRequest.fileName(),
                imageRequest.contentType()
            );
            category.setImageUrl(key);
        }

        return categoryRepository.save(category);
    }

    /**
     * Atualiza uma categoria existente (método que recebe DTO)
     */
    @Transactional
    public CategoryResponse updateCategory(UUID categoryId, UpdateCategoryRequest request) {
        // Busca a categoria existente
        Category existingCategory = categoryRepository.findById(categoryId)
                .orElseThrow(() -> new ObjectNotFoundException("Categoria não encontrada"));

        if (existingCategory.getDeletedAt() != null) {
            throw new IllegalUserArgumentException("Categoria foi deletada e não pode ser atualizada");
        }

        if (!userHasPermissionToEditStore(existingCategory.getStore())) {
            throw new InsufficientPermissionException("Usuário não tem permissão para atualizar esta categoria.");
        }

        // Atualiza a entidade com os dados do DTO usando MapStruct
        categoryMapper.updateEntityFromDto(request, existingCategory);
        
        // Atualiza a imagem se fornecida
        if (request.image() != null) {
            // Remove imagem antiga (soft delete e delete do storage)
            if (existingCategory.getImageUrl() != null) {
                imageService.deleteImage(existingCategory.getImageUrl());
            }

            // Faz upload da nova imagem para o storage (retorna KEY)
            String key = imageService.uploadBase64Image(
                request.image().base64Image(),
                request.image().fileName(),
                request.image().contentType()
            );
            existingCategory.setImageUrl(key);
        }

        // Salva as alterações
        Category updatedCategory = categoryRepository.save(existingCategory);
        
        // Converte para DTO de resposta
        return toCategoryResponse(updatedCategory);
    }

    /**
     * Atualiza uma categoria existente (método que trabalha com entidades)
     */
    @Transactional
    public Category updateCategory(UUID categoryId, Category updatedCategory, CategoryImageRequest imageRequest) {
        Category existingCategory = categoryRepository.findById(categoryId)
                .orElseThrow(() -> new ObjectNotFoundException("Categoria não encontrada"));

        if (existingCategory.getDeletedAt() != null) {
            throw new IllegalUserArgumentException("Categoria foi deletada e não pode ser atualizada");
        }

        if (!userHasPermissionToEditStore(existingCategory.getStore())) {
            throw new InsufficientPermissionException("Usuário não tem permissão para atualizar esta categoria.");
        }

        if (updatedCategory.getName() != null) {
            existingCategory.setName(updatedCategory.getName());
        }
        if (updatedCategory.getDescription() != null) {
            existingCategory.setDescription(updatedCategory.getDescription());
        }

        // Atualiza a imagem se fornecida
        if (imageRequest != null) {
            // Remove imagem antiga (soft delete e delete do storage)
            if (existingCategory.getImageUrl() != null) {
                imageService.deleteImage(existingCategory.getImageUrl());
            }

            // Faz upload da nova imagem para o storage (retorna KEY)
            String key = imageService.uploadBase64Image(
                imageRequest.base64Image(),
                imageRequest.fileName(),
                imageRequest.contentType()
            );
            existingCategory.setImageUrl(key);
        }

        return categoryRepository.save(existingCategory);
    }

    /**
     * Remove uma categoria (soft delete)
     */
    @Transactional
    public void deleteCategory(UUID categoryId) {
        Category category = categoryRepository.findById(categoryId)
                .orElseThrow(() -> new ObjectNotFoundException("Categoria não encontrada"));

        if (category.getDeletedAt() != null) {
            throw new IllegalUserArgumentException("Categoria já foi deletada");
        }

        if (!userHasPermissionToEditStore(category.getStore())) {
            throw new InsufficientPermissionException("Usuário não tem permissão para deletar esta categoria.");
        }

        // Soft delete da imagem também e delete do storage
        if (category.getImageUrl() != null) {
            imageService.deleteImage(category.getImageUrl());
        }

        category.setDeletedAt(Instant.now());
        categoryRepository.save(category);
    }

    /**
     * Busca uma categoria por ID (método que retorna DTO)
     */
    public CategoryResponse getCategoryById(UUID categoryId) {
        Category category = getCategoryByIdEntity(categoryId);
        return toCategoryResponse(category);
    }

    /**
     * Busca uma categoria por ID (método que retorna entidade)
     */
    public Category getCategoryByIdEntity(UUID categoryId) {
        Category category = categoryRepository.findById(categoryId)
                .orElseThrow(() -> new ObjectNotFoundException("Categoria não encontrada"));

        if (category.getDeletedAt() != null) {
            throw new IllegalUserArgumentException("Categoria foi deletada");
        }

        return category;
    }

    /**
     * Busca todas as categorias de uma loja (método que retorna DTOs)
     */
    public List<CategoryResponse> getCategoriesByStore(UUID storeId) {
        List<Category> categories = getCategoriesByStoreEntity(storeId);
        return categories.stream()
                .map(this::toCategoryResponse)
                .toList();
    }

    /**
     * Busca todas as categorias de uma loja (método que retorna entidades)
     */
    public List<Category> getCategoriesByStoreEntity(UUID storeId) {
        Store store = storeRepository.findById(storeId)
                .orElseThrow(() -> new ObjectNotFoundException("Loja não encontrada"));

        return categoryRepository.findByStoreAndDeletedAtIsNull(store);
    }

    /**
     * Converte uma entidade Category para CategoryResponse com presigned URL da imagem
     */
    private CategoryResponse toCategoryResponse(Category category) {
        // Gera presigned URL para imagem da categoria se existir
        String imageUrl = null;
        if (category.getImageUrl() != null && !category.getImageUrl().isEmpty()) {
            imageUrl = imageService.getPresignedUrl(category.getImageUrl());
        }
        
        // Usa o mapper para converter a entidade para DTO base
        CategoryResponse mappedResponse = categoryResponseMapper.toDto(category);
        
        // Cria a resposta final com presigned URL
        return new CategoryResponse(
            mappedResponse.id(),
            mappedResponse.name(),
            mappedResponse.description(),
            imageUrl,
            mappedResponse.storeId(),
            mappedResponse.createdAt(),
            mappedResponse.updatedAt()
        );
    }

    /**
     * Verifica se o usuário tem permissão para editar a loja
     * O usuário deve ser OWNER ou MANAGER da loja
     */
    private boolean userHasPermissionToEditStore(Store store) {
        var storeUsers = storeUserRepository.findByStore(store);
        var currentUser = jwtService.getCurrentAuthenticatedUser();

        return storeUsers.stream()
                .anyMatch(su -> su.getUser().getId().equals(currentUser.getId()) &&
                        (su.getRole() == UserRole.OWNER || su.getRole() == UserRole.MANAGER) &&
                        su.getDeletedAt() == null);
    }
}

