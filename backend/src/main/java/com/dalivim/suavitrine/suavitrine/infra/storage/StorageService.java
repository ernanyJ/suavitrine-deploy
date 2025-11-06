package com.dalivim.suavitrine.suavitrine.infra.storage;

import java.io.InputStream;
import java.time.Duration;

public interface StorageService {
    String uploadFile(String bucket, String key, InputStream inputStream, String contentType, long contentLength);
    InputStream getFile(String bucket, String key);
    void deleteFile(String bucket, String key);
    String getPresignedUrl(String bucket, String key, Duration expiration);
}
