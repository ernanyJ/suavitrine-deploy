package com.dalivim.suavitrine.suavitrine.services;

import com.dalivim.suavitrine.suavitrine.dtos.*;
import com.dalivim.suavitrine.suavitrine.entities.*;
import com.dalivim.suavitrine.suavitrine.entities.billing.PayingPlan;
import com.dalivim.suavitrine.suavitrine.infra.exceptions.IllegalUserArgumentException;
import com.dalivim.suavitrine.suavitrine.infra.exceptions.InsufficientPermissionException;
import com.dalivim.suavitrine.suavitrine.infra.exceptions.ObjectNotFoundException;
import com.dalivim.suavitrine.suavitrine.infra.security.JwtService;
import com.dalivim.suavitrine.suavitrine.mappers.*;
import com.dalivim.suavitrine.suavitrine.repositories.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class StoreService {

    private final StoreRepository storeRepository;
    private final StoreUserRepository storeUserRepository;
    private final UserRepository userRepository;
    private final JwtService jwtService;
    private final CategoryRepository categoryRepository;
    private final ProductRepository productRepository;
    private final ImageService imageService;
    private final StoreMapper storeMapper;
    private final StoreResponseMapper storeResponseMapper;
    private final AddressMapper addressMapper;
    private final ProductBasicMapper productBasicMapper;
    private final StoreUserResponseMapper storeUserResponseMapper;
    private final BillingRepository billingRepository;

    /**
     * Cria uma nova loja e associa o usuário criador como OWNER 
     */
    @Transactional
    public StoreResponse createStore(CreateStoreRequest request, UUID ownerUserId) {
        // Converte o DTO para Entity usando MapStruct
        Store store = storeMapper.toEntity(request);

        // Chama o método que trabalha com entidades
        Store createdStore = createStore(store, ownerUserId);
        processStoreLogo(request, store);


        // Converte para DTO de resposta
        return toStoreResponse(createdStore);
    }

    /**
     * Cria uma nova loja e associa o usuário criador como OWNER (método que trabalha com entidades)
     */
    @Transactional
    public Store createStore(Store store, UUID ownerUserId) {
        // Busca o usuário que será o owner
        User owner = userRepository.findById(ownerUserId)
                .orElseThrow(() -> new ObjectNotFoundException("Usuário não encontrado"));

        // Inicializa a lista de storeUsers se necessário
        if (store.getStoreUsers() == null) {
            store.setStoreUsers(new ArrayList<>());
        }

        // Salva a loja (o address será salvo em cascata)
        Store savedStore = storeRepository.save(store);

        // Cria o StoreUser com role OWNER
        StoreUser storeUser = new StoreUser();
        storeUser.setStore(savedStore);
        storeUser.setUser(owner);
        storeUser.setRole(UserRole.OWNER);
        
        StoreUser savedStoreUser = storeUserRepository.save(storeUser);

        // Adiciona o storeUser na lista da store
        savedStore.getStoreUsers().add(savedStoreUser);

        return savedStore;
    }

    /**
     * Atualiza os dados de uma loja 
     */
    @Transactional
    public StoreResponse updateStore(UUID storeId, UpdateStoreRequest request) {
        // Busca a loja existente
        Store existingStore = storeRepository.findById(storeId)
                .orElseThrow(() -> new ObjectNotFoundException("Loja não encontrada"));

        // Verifica se a loja não foi deletada
        if (existingStore.getDeletedAt() != null) {
            throw new IllegalUserArgumentException("Loja foi deletada e não pode ser atualizada");
        }

        boolean hasPermission = userHasPermissionToEditStore(existingStore);

        if (!hasPermission) {
            throw new InsufficientPermissionException("Usuário não tem permissão para atualizar esta loja.");
        }
        
        // Processa upload do logo se fornecido
        if (request.logo() != null) {
            // Remove logo antigo se existir
            if (existingStore.getLogoUrl() != null && !existingStore.getLogoUrl().isEmpty()) {
                imageService.deleteImage(existingStore.getLogoUrl());
            }
            
            // Faz upload do novo logo para o storage (retorna a KEY)
            String logoKey = imageService.uploadStoreLogo(
                request.logo().base64Image(),
                request.logo().fileName(),
                request.logo().contentType()
            );
            
            // Define a KEY no objeto store (não a URL)
            existingStore.setLogoUrl(logoKey);
        }
        
        // Atualiza a entidade com os dados do DTO usando MapStruct
        storeMapper.updateEntityFromDto(request, existingStore);
        
        // Salva as alterações
        Store updatedStore = storeRepository.save(existingStore);
        
        // Converte para DTO de resposta
        return toStoreResponse(updatedStore);
    }

    /**
     * Atualiza os dados de uma loja (método que trabalha com entidades)
     */
    @Transactional
    public Store updateStore(UUID storeId, Store updatedStore) {
        Store existingStore = storeRepository.findById(storeId)
                .orElseThrow(() -> new ObjectNotFoundException("Loja não encontrada"));

        // Verifica se a loja não foi deletada
        if (existingStore.getDeletedAt() != null) {
            throw new IllegalUserArgumentException("Loja foi deletada e não pode ser atualizada");
        }

        boolean hasPermission = userHasPermissionToEditStore(existingStore);

        if (!hasPermission) {
            throw new InsufficientPermissionException("Usuário não tem permissão para atualizar esta loja.");
        }

        // Atualiza os campos da loja existente com os valores da loja atualizada
        // O MapStruct já fez a conversão ignorando valores null
        if (updatedStore.getName() != null) {
            existingStore.setName(updatedStore.getName());
        }
        if (updatedStore.getPhoneNumber() != null) {
            existingStore.setPhoneNumber(updatedStore.getPhoneNumber());
        }
        if (updatedStore.getEmail() != null) {
            existingStore.setEmail(updatedStore.getEmail());
        }
        if (updatedStore.getInstagram() != null) {
            existingStore.setInstagram(updatedStore.getInstagram());
        }
        if (updatedStore.getFacebook() != null) {
            existingStore.setFacebook(updatedStore.getFacebook());
        }

        // Atualiza o endereço se fornecido
        if (updatedStore.getAddress() != null) {
            Address existingAddress = existingStore.getAddress();
            Address newAddress = updatedStore.getAddress();
            
            if (existingAddress == null) {
                existingStore.setAddress(newAddress);
            } else {
                if (newAddress.getStreet() != null) {
                    existingAddress.setStreet(newAddress.getStreet());
                }
                if (newAddress.getCity() != null) {
                    existingAddress.setCity(newAddress.getCity());
                }
                if (newAddress.getState() != null) {
                    existingAddress.setState(newAddress.getState());
                }
                if (newAddress.getZipCode() != null) {
                    existingAddress.setZipCode(newAddress.getZipCode());
                }
            }
        }

        return storeRepository.save(existingStore);
    }

    /**
     * Atualiza apenas a configuração de background de uma loja
     * Requer plano BASIC ou superior
     */
    @Transactional
    public StoreResponse updateBackground(UUID storeId, UpdateBackgroundRequest request) {
        // Busca a loja existente
        Store existingStore = storeRepository.findById(storeId)
                .orElseThrow(() -> new ObjectNotFoundException("Loja não encontrada"));

        // Verifica se a loja não foi deletada
        if (existingStore.getDeletedAt() != null) {
            throw new IllegalUserArgumentException("Loja foi deletada e não pode ser atualizada");
        }

        boolean hasPermission = userHasPermissionToEditStore(existingStore);

        if (!hasPermission) {
            throw new InsufficientPermissionException("Usuário não tem permissão para atualizar esta loja.");
        }

        // Verifica se a loja tem plano BASIC ou superior
        var currentActivePlan = billingRepository.findCurrentActivePlan(existingStore);
        if (currentActivePlan.isEmpty()) {
            throw new IllegalUserArgumentException("A loja não possui um plano ativo. É necessário ter pelo menos o plano BASIC para atualizar o background.");
        }

        var activePlan = currentActivePlan.get();
        if (activePlan.getPayingPlan() != PayingPlan.BASIC &&
            activePlan.getPayingPlan() != PayingPlan.PRO) {
            throw new InsufficientPermissionException("Atualização de background é uma feature disponível apenas para planos BASIC e PRO.");
        }

        // Atualiza apenas os campos de background
        if (request.backgroundType() != null) {
            existingStore.setBackgroundType(request.backgroundType());
        }
        if (request.backgroundEnabled() != null) {
            existingStore.setBackgroundEnabled(request.backgroundEnabled());
        }
        if (request.backgroundOpacity() != null) {
            existingStore.setBackgroundOpacity(request.backgroundOpacity());
        }
        if (request.backgroundColor() != null) {
            existingStore.setBackgroundColor(request.backgroundColor());
        }
        if (request.backgroundConfigJson() != null) {
            existingStore.setBackgroundConfigJson(request.backgroundConfigJson());
        }

        // Salva as alterações
        Store updatedStore = storeRepository.save(existingStore);

        // Converte para DTO de resposta
        return toStoreResponse(updatedStore);
    }

    /**
     * Atualiza a configuração de tema de uma loja 
     */
    @Transactional
    public StoreResponse updateThemeConfig(UUID storeId, UpdateThemeConfigRequest request) {
        // Busca a loja existente
        Store existingStore = storeRepository.findById(storeId)
                .orElseThrow(() -> new ObjectNotFoundException("Loja não encontrada"));

        // Verifica se a loja não foi deletada
        if (existingStore.getDeletedAt() != null) {
            throw new IllegalUserArgumentException("Loja foi deletada e não pode ser atualizada");
        }

        boolean hasPermission = userHasPermissionToEditStore(existingStore);

        if (!hasPermission) {
            throw new InsufficientPermissionException("Usuário não tem permissão para atualizar esta loja.");
        }
        
        // Processa upload do logo se fornecido
        if (request.logo() != null) {
            // Remove logo antigo se existir
            if (existingStore.getLogoUrl() != null && !existingStore.getLogoUrl().isEmpty()) {
                imageService.deleteImage(existingStore.getLogoUrl());
            }
            
            // Faz upload do novo logo para o storage (retorna a KEY)
            String logoKey = imageService.uploadStoreLogo(
                request.logo().base64Image(),
                request.logo().fileName(),
                request.logo().contentType()
            );
            
            // Define a KEY no objeto store (não a URL)
            existingStore.setLogoUrl(logoKey);
        }
        
        // Processa upload dos banners se fornecidos
        if (request.bannerDesktop() != null) {
            // Remove banner antigo se existir
            if (existingStore.getBannerDesktopUrl() != null && !existingStore.getBannerDesktopUrl().isEmpty()) {
                imageService.deleteImage(existingStore.getBannerDesktopUrl());
            }
            
            // Faz upload do novo banner para o storage (retorna a KEY)
            String bannerKey = imageService.uploadBase64Image(
                request.bannerDesktop().base64Image(),
                request.bannerDesktop().fileName(),
                request.bannerDesktop().contentType()
            );
            
            // Define a KEY no objeto store (não a URL)
            existingStore.setBannerDesktopUrl(bannerKey);
        }
        
        if (request.bannerTablet() != null) {
            // Remove banner antigo se existir
            if (existingStore.getBannerTabletUrl() != null && !existingStore.getBannerTabletUrl().isEmpty()) {
                imageService.deleteImage(existingStore.getBannerTabletUrl());
            }
            
            // Faz upload do novo banner para o storage (retorna a KEY)
            String bannerKey = imageService.uploadBase64Image(
                request.bannerTablet().base64Image(),
                request.bannerTablet().fileName(),
                request.bannerTablet().contentType()
            );
            
            // Define a KEY no objeto store (não a URL)
            existingStore.setBannerTabletUrl(bannerKey);
        }
        
        if (request.bannerMobile() != null) {
            // Remove banner antigo se existir
            if (existingStore.getBannerMobileUrl() != null && !existingStore.getBannerMobileUrl().isEmpty()) {
                imageService.deleteImage(existingStore.getBannerMobileUrl());
            }
            
            // Faz upload do novo banner para o storage (retorna a KEY)
            String bannerKey = imageService.uploadBase64Image(
                request.bannerMobile().base64Image(),
                request.bannerMobile().fileName(),
                request.bannerMobile().contentType()
            );
            
            // Define a KEY no objeto store (não a URL)
            existingStore.setBannerMobileUrl(bannerKey);
        }
        
        // Atualiza a entidade com os dados do DTO usando MapStruct (exceto banners)
        storeMapper.updateThemeConfigFromDto(request, existingStore);
        
        // Salva as alterações
        Store updatedStore = storeRepository.save(existingStore);
        
        // Converte para DTO de resposta
        return toStoreResponse(updatedStore);
    }

    /**
     * Atualiza a configuração de tema de uma loja (método que trabalha com entidades)
     */
    @Transactional
    public Store updateThemeConfig(UUID storeId, Store updatedStore) {
        Store existingStore = storeRepository.findById(storeId)
                .orElseThrow(() -> new ObjectNotFoundException("Loja não encontrada"));

        // Verifica se a loja não foi deletada
        if (existingStore.getDeletedAt() != null) {
            throw new IllegalUserArgumentException("Loja foi deletada e não pode ser atualizada");
        }

        boolean hasPermission = userHasPermissionToEditStore(existingStore);

        if (!hasPermission) {
            throw new InsufficientPermissionException("Usuário não tem permissão para atualizar esta loja.");
        }

        // Atualiza os campos de tema
        if (updatedStore.getPrimaryColor() != null) {
            existingStore.setPrimaryColor(updatedStore.getPrimaryColor());
        }
        if (updatedStore.getThemeMode() != null) {
            existingStore.setThemeMode(updatedStore.getThemeMode());
        }
        if (updatedStore.getPrimaryFont() != null) {
            existingStore.setPrimaryFont(updatedStore.getPrimaryFont());
        }
        if (updatedStore.getSecondaryFont() != null) {
            existingStore.setSecondaryFont(updatedStore.getSecondaryFont());
        }
        if (updatedStore.getRoundedLevel() != null) {
            existingStore.setRoundedLevel(updatedStore.getRoundedLevel());
        }
        if (updatedStore.getProductCardShadow() != null) {
            existingStore.setProductCardShadow(updatedStore.getProductCardShadow());
        }

        // Atualiza banners
        if (updatedStore.getBannerDesktopUrl() != null) {
            existingStore.setBannerDesktopUrl(updatedStore.getBannerDesktopUrl());
        }
        if (updatedStore.getBannerTabletUrl() != null) {
            existingStore.setBannerTabletUrl(updatedStore.getBannerTabletUrl());
        }
        if (updatedStore.getBannerMobileUrl() != null) {
            existingStore.setBannerMobileUrl(updatedStore.getBannerMobileUrl());
        }

        return storeRepository.save(existingStore);
    }

    /**
     * Adiciona um novo usuário a uma loja 
     */
    @Transactional
    public StoreUserResponse addUserToStore(UUID storeId, UUID userId, UserRole role) {
        StoreUser storeUser = addUserToStoreEntity(storeId, userId, role);
        return storeUserResponseMapper.toDto(storeUser);
    }

    /**
     * Adiciona um novo usuário a uma loja 
     */
    @Transactional
    public StoreUser addUserToStoreEntity(UUID storeId, UUID userId, UserRole role) {
        Store store = storeRepository.findById(storeId)
                .orElseThrow(() -> new ObjectNotFoundException("Loja não encontrada"));

        if (store.getDeletedAt() != null) {
            throw new IllegalUserArgumentException("Loja foi deletada");
        }

        boolean hasPermission = userHasPermissionToEditStore(store);

        if (!hasPermission) {
            throw new InsufficientPermissionException("Usuário não tem permissão para adicionar outros usuários à esta loja.");
        }

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ObjectNotFoundException("Usuário não encontrado"));

        // Verifica se o usuário já está associado à loja
        boolean alreadyExists = storeUserRepository.existsByStoreAndUser(store, user);
        if (alreadyExists) {
            throw new IllegalUserArgumentException("Usuário já está associado a esta loja");
        }

        // Cria o StoreUser
        StoreUser storeUser = new StoreUser();
        storeUser.setStore(store);
        storeUser.setUser(user);
        storeUser.setRole(role);

        return storeUserRepository.save(storeUser);
    }

    /**
     * Converte uma entidade Store para StoreResponse com presigned URLs
     */
    private StoreResponse toStoreResponse(Store store) {
        // Converte logo URL (KEY) para presigned URL se existir
        String logoUrl = null;
        if (store.getLogoUrl() != null && !store.getLogoUrl().isEmpty()) {
            logoUrl = imageService.getPresignedUrl(store.getLogoUrl());
        }
        
        // Converte banner URLs (KEYS) para presigned URLs se existirem
        String bannerDesktopUrl = null;
        if (store.getBannerDesktopUrl() != null && !store.getBannerDesktopUrl().isEmpty()) {
            bannerDesktopUrl = imageService.getPresignedUrl(store.getBannerDesktopUrl());
        }
        
        String bannerTabletUrl = null;
        if (store.getBannerTabletUrl() != null && !store.getBannerTabletUrl().isEmpty()) {
            bannerTabletUrl = imageService.getPresignedUrl(store.getBannerTabletUrl());
        }
        
        String bannerMobileUrl = null;
        if (store.getBannerMobileUrl() != null && !store.getBannerMobileUrl().isEmpty()) {
            bannerMobileUrl = imageService.getPresignedUrl(store.getBannerMobileUrl());
        }
        
        // Busca o plano ativo da loja
        PayingPlan activePlan = null;
        var currentActivePlan = billingRepository.findCurrentActivePlan(store);
        if (currentActivePlan.isPresent()) {
            activePlan = currentActivePlan.get().getPayingPlan();
        }
        
        // Usa o mapper para converter a entidade para DTO base
        StoreResponse mappedResponse = storeResponseMapper.toDto(store);
        
        // Cria a resposta final com presigned URLs e plano ativo
        return new StoreResponse(
            mappedResponse.id(),
            mappedResponse.name(),
            mappedResponse.description(),
            mappedResponse.slug(),
            mappedResponse.address(),
            mappedResponse.phoneNumber(),
            mappedResponse.email(),
            mappedResponse.instagram(),
            mappedResponse.facebook(),
            logoUrl,
            mappedResponse.primaryColor(),
            mappedResponse.themeMode(),
            mappedResponse.primaryFont(),
            mappedResponse.secondaryFont(),
            mappedResponse.roundedLevel(),
            mappedResponse.productCardShadow(),
            bannerDesktopUrl,
            bannerTabletUrl,
            bannerMobileUrl,
            mappedResponse.backgroundType(),
            mappedResponse.backgroundEnabled(),
            mappedResponse.backgroundOpacity(),
            mappedResponse.backgroundColor(),
            mappedResponse.backgroundConfigJson(),
            activePlan,
            mappedResponse.createdAt(),
            mappedResponse.updatedAt()
        );
    }

    /**
     * Remove um usuário de uma loja (soft delete)
     */
    @Transactional
    public void removeUserFromStore(UUID storeId, UUID userId) {
        Store store = storeRepository.findById(storeId)
                .orElseThrow(() -> new ObjectNotFoundException("Loja não encontrada"));

        boolean hasPermission = userHasPermissionToEditStore(store);

        if (!hasPermission) {
            throw new InsufficientPermissionException("Usuário não tem permissão para adicionar outros usuários à esta loja.");
        }

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ObjectNotFoundException("Usuário não encontrado"));

        StoreUser storeUser = storeUserRepository.findByStoreAndUser(store, user)
                .orElseThrow(() -> new ObjectNotFoundException("Usuário não está associado a esta loja"));

        // Verifica se já foi deletado
        if (storeUser.getDeletedAt() != null) {
            throw new IllegalUserArgumentException("Usuário já foi removido desta loja");
        }

        // Soft delete - atualiza o deletedAt
        storeUser.setDeletedAt(Instant.now());
        storeUserRepository.save(storeUser);
    }

    /**
     * Busca uma loja por ID 
     */
    public StoreResponse getStoreById(UUID storeId) {
        Store store = getStoreByIdEntity(storeId);
        return toStoreResponse(store);
    }

    /**
     * Busca uma loja por ID (método que retorna entidade)
     */
    public Store getStoreByIdEntity(UUID storeId) {
        var store =  storeRepository.findById(storeId)
                .orElseThrow(() -> new ObjectNotFoundException("Loja não encontrada"));

        boolean hasPermission = userHasPermissionToEditStore(store);
        if (!hasPermission) {
            throw new InsufficientPermissionException("Usuário não tem permissão para adicionar outros usuários à esta loja.");
        }

        return store;
    }

    /**
     * Busca uma loja por slug (público, sem autenticação)
     */
    public StoreResponse getStoreBySlug(String slug) {
        Store store = getStoreBySlugEntity(slug);
        return toStoreResponse(store);
    }

    /**
     * Busca uma loja por slug (método que retorna entidade, público, sem autenticação)
     */
    public Store getStoreBySlugEntity(String slug) {
        Store store = storeRepository.findBySlug(slug)
                .orElseThrow(() -> new ObjectNotFoundException("Loja não encontrada com o slug: " + slug));
        
        return store;
    }

    /**
     * Busca categorias da loja
     */
    public List<Category> getCategoriesByStore(Store store) {
        return categoryRepository.findByStoreAndDeletedAtIsNull(store);
    }

    /**
     * Busca produtos da loja
     */
    public List<Product> getProductsByStore(Store store) {
        return productRepository.findByStoreAndDeletedAtIsNull(store);
    }

    /**
     * Busca apenas produtos disponíveis da loja (para endpoints públicos)
     */
    public List<Product> getAvailableProductsByStore(Store store) {
        return productRepository.findByStoreAndDeletedAtIsNullAndAvailableTrue(store);
    }

    /**
     * Busca uma loja pública completa com categorias e produtos (público)
     * Retorna apenas produtos disponíveis (available = true)
     */
    public StorePublicResponse getPublicStoreBySlug(String slug) {
        Store store = getStoreBySlugEntity(slug);
        
        // Busca categorias e apenas produtos disponíveis da loja
        List<Category> categories = getCategoriesByStore(store);
        List<Product> allProducts = getAvailableProductsByStore(store);
        
        // Agrupa produtos por categoria
        Map<Category, List<Product>> productsByCategory = 
            allProducts.stream()
                .filter(p -> p.getCategory() != null)
                .collect(Collectors.groupingBy(Product::getCategory));
        
        // Cria categorias com produtos
        List<CategoryWithProductsResponse> categoriesWithProducts = categories.stream()
            .map(category -> {
                // Garante ordenação por displayOrder (valores menores primeiro)
                // Produtos sem displayOrder aparecem por último
                List<Product> categoryProducts = 
                    productsByCategory.getOrDefault(category, List.of()).stream()
                        .sorted((p1, p2) -> {
                            Integer order1 = p1.getDisplayOrder();
                            Integer order2 = p2.getDisplayOrder();
                            
                            if (order1 == null && order2 == null) return 0;
                            if (order1 == null) return 1; // null vai para o final
                            if (order2 == null) return -1; // null vai para o final
                            
                            return order1.compareTo(order2);
                        })
                        .collect(Collectors.toList());
                
                List<ProductBasicResponse> productsDto = productBasicMapper.toDtoList(categoryProducts);
                
                // Gera presigned URL para imagem da categoria se existir
                String categoryImageUrl = category.getImageUrl() != null
                    ? imageService.getPresignedUrl(category.getImageUrl())
                    : null;
                
                return new CategoryWithProductsResponse(
                    category.getId(),
                    category.getName(),
                    category.getDescription(),
                    categoryImageUrl,
                    category.getStore().getId(),
                    productsDto,
                    category.getCreatedAt(),
                    category.getUpdatedAt()
                );
            })
            .collect(Collectors.toList());
        
        // Busca produtos sem categoria
        List<Product> productsWithoutCategory = 
            allProducts.stream()
                .filter(p -> p.getCategory() == null)
                // Ordena por displayOrder (valores menores primeiro)
                // Produtos sem displayOrder aparecem por último
                .sorted((p1, p2) -> {
                    Integer order1 = p1.getDisplayOrder();
                    Integer order2 = p2.getDisplayOrder();
                    
                    if (order1 == null && order2 == null) return 0;
                    if (order1 == null) return 1; // null vai para o final
                    if (order2 == null) return -1; // null vai para o final
                    
                    return order1.compareTo(order2);
                })
                .collect(Collectors.toList());
        
        // Adiciona produtos sem categoria em uma categoria especial
        if (!productsWithoutCategory.isEmpty()) {
            List<ProductBasicResponse> productsDto = productBasicMapper.toDtoList(productsWithoutCategory);
            categoriesWithProducts.add(new CategoryWithProductsResponse(
                null,
                "Outros",
                "Produtos sem categoria",
                null, // Sem imagem para categoria "Outros"
                store.getId(),
                productsDto,
                null,
                null
            ));
        }
        
        StoreResponse storeResponse = toStoreResponse(store);
        
        return new StorePublicResponse(
            storeResponse.id(),
            storeResponse.name(),
            storeResponse.description(),
            storeResponse.slug(),
            storeResponse.address(),
            storeResponse.phoneNumber(),
            storeResponse.email(),
            storeResponse.instagram(),
            storeResponse.facebook(),
            storeResponse.logoUrl(),
            storeResponse.primaryColor(),
            storeResponse.themeMode(),
            storeResponse.primaryFont(),
            storeResponse.secondaryFont(),
            storeResponse.roundedLevel(),
            storeResponse.productCardShadow(),
            storeResponse.bannerDesktopUrl(),
            storeResponse.bannerTabletUrl(),
            storeResponse.bannerMobileUrl(),
            storeResponse.backgroundType(),
            storeResponse.backgroundEnabled(),
            storeResponse.backgroundOpacity(),
            storeResponse.backgroundColor(),
            storeResponse.backgroundConfigJson(),
            categoriesWithProducts,
            storeResponse.createdAt(),
            storeResponse.updatedAt()
        );
    }

    /**
     * Busca todas as lojas de um usuário (método que retorna DTOs)
     */
    public List<StoreUserResponse> getUserStores(UUID userId) {
        List<StoreUser> storeUsers = getUserStoresEntities(userId);
        return storeUserResponseMapper.toDtoList(storeUsers);
    }

    /**
     * Busca todas as lojas de um usuário (método que retorna entidades)
     */
    public List<StoreUser> getUserStoresEntities(UUID userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ObjectNotFoundException("Usuário não encontrado"));

        return storeUserRepository.findByUser(user).stream()
                .filter(storeUser -> storeUser.getDeletedAt() == null)
                .toList();
    }

    /**
     * Busca todos os usuários de uma loja (método que retorna DTOs)
     */
    public List<StoreUserResponse> getStoreUsers(UUID storeId) {
        List<StoreUser> storeUsers = getStoreUsersEntities(storeId);
        return storeUserResponseMapper.toDtoList(storeUsers);
    }

    /**
     * Busca todos os usuários de uma loja (método que retorna entidades)
     */
    public List<StoreUser> getStoreUsersEntities(UUID storeId) {
        Store store = storeRepository.findById(storeId)
                .orElseThrow(() -> new ObjectNotFoundException("Loja não encontrada"));

        return storeUserRepository.findByStore(store).stream()
                .filter(storeUser -> storeUser.getDeletedAt() == null)
                .toList();
    }

    // O usuário tem que pertencer a lista de storeusers dessa store, e ter role superior a EMPLOYEE
    private boolean userHasPermissionToEditStore(Store existingStore) {
        var storeUsers = storeUserRepository.findByStore(existingStore);
        var currentUser = jwtService.getCurrentAuthenticatedUser();

        return storeUsers.stream()
                .anyMatch(su -> su.getUser().getId().equals(currentUser.getId()) &&
                        (su.getRole() == UserRole.OWNER || su.getRole() == UserRole.MANAGER));
    }

    private boolean validateUserBelongsToStore(UUID storeId, UUID userId) {
        Store store = storeRepository.findById(storeId)
                .orElseThrow(() -> new ObjectNotFoundException("Loja não encontrada"));

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ObjectNotFoundException("Usuário não encontrado"));

        return storeUserRepository.existsByStoreAndUser(store, user);
    }

    /**
     * Obtém a primeira loja do usuário autenticado
     * Para MVP, assumimos que cada usuário tem apenas uma loja
     */
    public Store getCurrentUserStore() {
        var currentUser = jwtService.getCurrentAuthenticatedUser();
        List<StoreUser> userStores = getUserStoresEntities(currentUser.getId());
        
        if (userStores.isEmpty()) {
            throw new ObjectNotFoundException("Usuário não possui lojas associadas");
        }
        
        return userStores.get(0).getStore();
    }


    private void processStoreLogo(CreateStoreRequest request, Store store){
        // Processa upload do logo se fornecido
        if (request.logo() != null) {
            String logoKey = imageService.uploadStoreLogo(
                    request.logo().base64Image(),
                    request.logo().fileName(),
                    request.logo().contentType()
            );
            store.setLogoUrl(logoKey);
            storeRepository.save(store);
        }
    }

}

