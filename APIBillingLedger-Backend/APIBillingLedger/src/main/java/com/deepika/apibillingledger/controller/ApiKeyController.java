package com.deepika.apibillingledger.controller;

import com.deepika.apibillingledger.dto.ApiKeyResponse;
import com.deepika.apibillingledger.model.ApiKey;
import com.deepika.apibillingledger.model.User;
import com.deepika.apibillingledger.repository.ApiKeyRepository;
import com.deepika.apibillingledger.repository.UserRepository;
import com.deepika.apibillingledger.service.ApiKeyService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/keys")
@RequiredArgsConstructor
public class ApiKeyController {

    private final ApiKeyService apiKeyService;
    private final UserRepository userRepository;
    private final ApiKeyRepository apiKeyRepository;

    @PostMapping("/generate")
    public ResponseEntity<?> generateKey(@AuthenticationPrincipal UserDetails userDetails) {
        User user = userRepository.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new RuntimeException("User not found"));

        String newKey = apiKeyService.generateNewKeyForUser(user);
        return ResponseEntity.ok(Map.of("apiKey", newKey));
    }

    @GetMapping
    public ResponseEntity<List<ApiKeyResponse>> listMyKeys(@AuthenticationPrincipal UserDetails userDetails) {
        User user = userRepository.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new RuntimeException("User not found"));

        List<ApiKey> keys = apiKeyRepository.findByUser(user);

        // Map to a DTO so we don't leak the key_hash!
        List<ApiKeyResponse> response = keys.stream()
                .map(key -> new ApiKeyResponse(
                        key.getId(),
                        key.getName(),
                        key.getPrefix(),
                        key.isActive(),
                        key.getCreatedAt(),
                        key.getLastUsedAt()
                )).toList();

        return ResponseEntity.ok(response);
    }
}