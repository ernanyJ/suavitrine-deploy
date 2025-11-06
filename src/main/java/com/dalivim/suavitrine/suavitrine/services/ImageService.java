package com.dalivim.suavitrine.suavitrine.services;

import com.dalivim.suavitrine.suavitrine.dtos.ProductImageRequest;
import com.dalivim.suavitrine.suavitrine.infra.exceptions.IllegalUserArgumentException;
import com.dalivim.suavitrine.suavitrine.infra.storage.StorageService;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.io.ByteArrayInputStream;
import java.io.InputStream;
import java.util.Base64;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class ImageService {

    private final StorageService storageService;

    @Value("${storage.bucket-name}")
    private String bucketName;

    /**
     * Faz upload de uma imagem base64 para o storage e retorna a KEY
     */
    public String uploadBase64Image(String base64Image, String fileName, String contentType) {
        try {
            // Remove o prefixo data:image/png;base64, se existir
            String base64Data = base64Image;
            if (base64Image.contains(",")) {
                base64Data = base64Image.substring(base64Image.indexOf(",") + 1);
            }

            // Decodifica o base64
            byte[] imageBytes = Base64.getDecoder().decode(base64Data);

            // Valida o tamanho da imagem (máximo 5MB)
            validateImageSize(imageBytes);

            // Gera um nome único para o arquivo
            String uniqueFileName = generateUniqueFileName(fileName);

            // Faz upload para o storage
            InputStream inputStream = new ByteArrayInputStream(imageBytes);
            String key = storageService.uploadFile(bucketName, uniqueFileName, inputStream, contentType, imageBytes.length);

            // Retorna apenas a KEY (não a URL)
            return key;

        } catch (Exception e) {
            throw new IllegalUserArgumentException("Erro ao fazer upload da imagem: " + e.getMessage());
        }
    }
    
    /**
     * Gera uma presigned URL para a imagem (válida por 1 hora)
     */
    public String getPresignedUrl(String key) {
        if (key == null || key.isEmpty()) {
            return null;
        }
        try {
            return storageService.getPresignedUrl(bucketName, key, java.time.Duration.ofHours(1));
        } catch (Exception e) {
            System.err.println("Erro ao gerar presigned URL: " + e.getMessage());
            return null;
        }
    }

    /**
     * Faz upload de múltiplas imagens e retorna as URLs
     */
    public List<String> uploadMultipleImages(List<ProductImageRequest> imageRequests) {
        if (imageRequests == null || imageRequests.isEmpty()) {
            return List.of();
        }

        return imageRequests.stream()
                .map(img -> uploadBase64Image(img.base64Image(), img.fileName(), img.contentType()))
                .toList();
    }

    /**
     * Faz upload de uma imagem de logo da loja base64 para o storage e retorna a KEY
     */
    public String uploadStoreLogo(String base64Image, String fileName, String contentType) {
        try {
            // Remove o prefixo data:image/png;base64, se existir
            String base64Data = base64Image;
            if (base64Image.contains(",")) {
                base64Data = base64Image.substring(base64Image.indexOf(",") + 1);
            }

            // Decodifica o base64
            byte[] imageBytes = Base64.getDecoder().decode(base64Data);

            // Valida o tamanho da imagem (máximo 5MB)
            validateImageSize(imageBytes);

            // Gera um nome único para o arquivo usando o prefixo "stores/logos/"
            String uniqueFileName = generateUniqueStoreLogoFileName(fileName);

            // Faz upload para o storage
            InputStream inputStream = new ByteArrayInputStream(imageBytes);
            String key = storageService.uploadFile(bucketName, uniqueFileName, inputStream, contentType, imageBytes.length);

            // Retorna apenas a KEY (não a URL)
            return key;

        } catch (Exception e) {
            throw new IllegalUserArgumentException("Erro ao fazer upload do logo: " + e.getMessage());
        }
    }

    /**
     * Deleta uma imagem do storage usando a key
     */
    public void deleteImage(String key) {
        if (key == null || key.isEmpty()) {
            return;
        }

        try {
            storageService.deleteFile(bucketName, key);
        } catch (Exception e) {
            // Log error but don't throw - deletion of images should not fail the main operation
            System.err.println("Erro ao deletar imagem do storage: " + e.getMessage());
        }
    }

    /**
     * Deleta múltiplas imagens do storage
     */
    public void deleteMultipleImages(List<String> imageUrls) {
        if (imageUrls == null || imageUrls.isEmpty()) {
            return;
        }

        imageUrls.forEach(this::deleteImage);
    }

    /**
     * Gera um nome único para o arquivo
     */
    private String generateUniqueFileName(String originalFileName) {
        String extension = "";
        if (originalFileName != null && originalFileName.contains(".")) {
            extension = originalFileName.substring(originalFileName.lastIndexOf("."));
        }

        String uuid = UUID.randomUUID().toString();
        String timestamp = String.valueOf(System.currentTimeMillis());

        return "products/" + uuid + "-" + timestamp + extension;
    }

    /**
     * Gera um nome único para o arquivo de logo da loja
     */
    public String generateUniqueStoreLogoFileName(String originalFileName) {
        String extension = "";
        if (originalFileName != null && originalFileName.contains(".")) {
            extension = originalFileName.substring(originalFileName.lastIndexOf("."));
        }

        String uuid = UUID.randomUUID().toString();
        String timestamp = String.valueOf(System.currentTimeMillis());

        return "stores/logos/" + uuid + "-" + timestamp + extension;
    }


    /**
     * Valida o tamanho da imagem (máximo 5MB)
     */
    private void validateImageSize(byte[] imageBytes) {
        int maxSize = 5 * 1024 * 1024; // 5MB
        if (imageBytes.length > maxSize) {
            throw new IllegalUserArgumentException("Imagem muito grande. Tamanho máximo: 5MB");
        }
    }
}

