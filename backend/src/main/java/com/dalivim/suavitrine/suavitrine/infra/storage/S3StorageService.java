package com.dalivim.suavitrine.suavitrine.infra.storage;

import com.dalivim.suavitrine.suavitrine.infra.exceptions.IllegalUserArgumentException;
import io.sentry.Sentry;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import software.amazon.awssdk.auth.credentials.AwsBasicCredentials;
import software.amazon.awssdk.auth.credentials.StaticCredentialsProvider;
import software.amazon.awssdk.core.ResponseInputStream;
import software.amazon.awssdk.core.sync.RequestBody;
import software.amazon.awssdk.regions.Region;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.S3Configuration;
import software.amazon.awssdk.services.s3.model.DeleteObjectRequest;
import software.amazon.awssdk.services.s3.model.GetObjectRequest;
import software.amazon.awssdk.services.s3.model.GetObjectResponse;
import software.amazon.awssdk.services.s3.model.PutObjectRequest;
import software.amazon.awssdk.services.s3.presigner.S3Presigner;
import software.amazon.awssdk.services.s3.presigner.model.GetObjectPresignRequest;
import software.amazon.awssdk.services.s3.presigner.model.PresignedGetObjectRequest;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.net.URI;
import java.time.Duration;
import java.util.Arrays;
import java.util.HashSet;
import java.util.Locale;
import java.util.Set;

@Service
public class S3StorageService implements StorageService {

    private final S3Client s3Client;
    private final S3Presigner s3Presigner;

    // Tipos MIME válidos para imagens (apenas JPG, JPEG e PNG)
    private static final Set<String> ALLOWED_IMAGE_MIME_TYPES = new HashSet<>(Arrays.asList(
            "image/jpeg",
            "image/jpg",
            "image/png"
    ));

    // Extensões de arquivo válidas para imagens (apenas JPG, JPEG e PNG)
    private static final Set<String> ALLOWED_IMAGE_EXTENSIONS = new HashSet<>(Arrays.asList(
            ".jpg", ".jpeg", ".png"
    ));

    // Magic bytes (assinaturas de arquivo) para validação de imagens
    private static final byte[] JPEG_SIGNATURE = {(byte) 0xFF, (byte) 0xD8, (byte) 0xFF};
    private static final byte[] PNG_SIGNATURE = {(byte) 0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A};

    public S3StorageService(@Value("${storage.endpoint}") String endpoint,
                            @Value("${storage.access-key}") String accessKey,
                            @Value("${storage.secret-key}") String secretKey,
                            @Value("${storage.region}") String region) {

        // Remove trailing slash from endpoint if present (R2 requirement)
        String cleanEndpoint = endpoint.endsWith("/") ? endpoint.substring(0, endpoint.length() - 1) : endpoint;

        S3Configuration s3Config = S3Configuration.builder()
                .pathStyleAccessEnabled(true)
                .chunkedEncodingEnabled(false)
                .build();

        this.s3Client = S3Client.builder()
                .endpointOverride(URI.create(cleanEndpoint))
                .region(Region.of("auto"))
                .serviceConfiguration(s3Config)
                .credentialsProvider(
                        StaticCredentialsProvider.create(AwsBasicCredentials.create(accessKey, secretKey))
                )
                .build();

        this.s3Presigner = S3Presigner.builder()
                .endpointOverride(URI.create(cleanEndpoint))
                .region(Region.of("auto"))
                .serviceConfiguration(s3Config)
                .credentialsProvider(
                        StaticCredentialsProvider.create(AwsBasicCredentials.create(accessKey, secretKey))
                )
                .build();
    }

    @Override
    public String uploadFile(String bucket, String key, InputStream inputStream, String contentType, long contentLength) {
        try {
            // Valida se é uma imagem
            validateImageFile(inputStream, contentType, key, contentLength);

            // Reset do stream após validação (precisamos ler novamente para o upload)
            // Como já validamos, vamos criar um novo stream a partir dos bytes lidos
            byte[] imageBytes = readInputStream(inputStream, contentLength);
            validateImageMagicBytes(imageBytes);

            s3Client.putObject(
                    PutObjectRequest.builder()
                            .bucket(bucket)
                            .key(key)
                            .contentType(contentType)
                            .build(),
                    RequestBody.fromBytes(imageBytes)
            );
        } catch (IllegalUserArgumentException e) {
            throw e; // Re-throw validation errors
        } catch (Exception e) {
            Sentry.captureException(e);
            throw new RuntimeException("Failed to upload file: " + e.getMessage(), e);
        }
        return key;
    }

    /**
     * Valida se o arquivo é uma imagem válida
     */
    private void validateImageFile(InputStream inputStream, String contentType, String key, long contentLength) {
        // Valida contentType
        if (contentType == null || contentType.trim().isEmpty()) {
            throw new IllegalUserArgumentException("Tipo de conteúdo não especificado. Apenas JPG, JPEG e PNG são permitidos.");
        }

        String normalizedContentType = contentType.toLowerCase(Locale.ROOT).trim();
        if (!normalizedContentType.startsWith("image/")) {
            throw new IllegalUserArgumentException(
                    String.format("Tipo de arquivo não permitido: %s. Apenas JPG, JPEG e PNG são permitidos.", contentType)
            );
        }

        // Valida se o MIME type está na lista permitida
        if (!ALLOWED_IMAGE_MIME_TYPES.contains(normalizedContentType)) {
            throw new IllegalUserArgumentException(
                    String.format("Tipo de imagem não suportado: %s. Apenas JPG, JPEG e PNG são permitidos.", contentType)
            );
        }

        // Valida extensão do arquivo pela key
        if (key != null && !key.isEmpty()) {
            String lowerKey = key.toLowerCase(Locale.ROOT);
            boolean hasValidExtension = ALLOWED_IMAGE_EXTENSIONS.stream()
                    .anyMatch(lowerKey::endsWith);
            
            if (!hasValidExtension) {
                throw new IllegalUserArgumentException(
                        String.format("Extensão de arquivo não permitida. Apenas JPG, JPEG e PNG são permitidos: %s", 
                                String.join(", ", ALLOWED_IMAGE_EXTENSIONS))
                );
            }
        }

        // Valida tamanho do arquivo (máximo 5MB)
        if (contentLength > 5 * 1024 * 1024) {
            throw new IllegalUserArgumentException("Arquivo muito grande. Tamanho máximo: 5MB");
        }

        if (contentLength <= 0) {
            throw new IllegalUserArgumentException("Arquivo vazio ou inválido.");
        }
    }

    /**
     * Valida os magic bytes do arquivo para garantir que é realmente uma imagem
     */
    private void validateImageMagicBytes(byte[] fileBytes) {
        if (fileBytes == null || fileBytes.length < 4) {
            throw new IllegalUserArgumentException("Arquivo inválido ou muito pequeno.");
        }

        // Verifica assinaturas de arquivos de imagem (apenas JPEG e PNG)
        boolean isValidImage = 
                startsWith(fileBytes, JPEG_SIGNATURE) ||
                startsWith(fileBytes, PNG_SIGNATURE);

        if (!isValidImage) {
            throw new IllegalUserArgumentException(
                    "Arquivo não é uma imagem válida. Apenas JPG, JPEG e PNG são permitidos."
            );
        }
    }

    /**
     * Verifica se o array de bytes começa com a assinatura especificada
     */
    private boolean startsWith(byte[] array, byte[] signature) {
        if (array.length < signature.length) {
            return false;
        }
        for (int i = 0; i < signature.length; i++) {
            if (array[i] != signature[i]) {
                return false;
            }
        }
        return true;
    }

    /**
     * Lê o InputStream para um array de bytes
     */
    private byte[] readInputStream(InputStream inputStream, long contentLength) throws IOException {
        ByteArrayOutputStream buffer = new ByteArrayOutputStream();
        byte[] data = new byte[8192];
        int nRead;
        long totalRead = 0;
        
        while ((nRead = inputStream.read(data, 0, data.length)) != -1) {
            buffer.write(data, 0, nRead);
            totalRead += nRead;
            
            // Proteção contra leitura excessiva
            if (totalRead > contentLength) {
                throw new IOException("Tamanho do arquivo excede o esperado.");
            }
        }
        
        return buffer.toByteArray();
    }

    @Override
    public InputStream getFile(String bucket, String key) {
        ResponseInputStream<GetObjectResponse> response =
                s3Client.getObject(GetObjectRequest.builder().bucket(bucket).key(key).build());
        return response;
    }

    @Override
    public void deleteFile(String bucket, String key) {
        s3Client.deleteObject(DeleteObjectRequest.builder().bucket(bucket).key(key).build());
    }

    @Override
    public String getPresignedUrl(String bucket, String key, Duration expiration) {
        try {
            GetObjectRequest getObjectRequest = GetObjectRequest.builder()
                    .bucket(bucket)
                    .key(key)
                    .build();


            GetObjectPresignRequest presignRequest = GetObjectPresignRequest.builder()
                    .signatureDuration(expiration)
                    .getObjectRequest(getObjectRequest)
                    .build();

            PresignedGetObjectRequest presignedRequest = s3Presigner.presignGetObject(presignRequest);
            return presignedRequest.url().toString();
        } catch (Exception e) {
            Sentry.captureException(e);
            System.err.println("Error generating presigned URL: " + e.getMessage());
            throw new RuntimeException("Failed to generate presigned URL: " + e.getMessage(), e);
        }
    }
}
