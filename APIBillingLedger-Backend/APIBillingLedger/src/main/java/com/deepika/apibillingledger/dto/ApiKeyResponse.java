package com.deepika.apibillingledger.dto;



import java.time.LocalDateTime;
import java.util.UUID;

public record ApiKeyResponse(
    UUID id,
    String name,
    String prefix,
    boolean isActive,
    LocalDateTime createdAt,
    LocalDateTime lastUsedAt
) {}