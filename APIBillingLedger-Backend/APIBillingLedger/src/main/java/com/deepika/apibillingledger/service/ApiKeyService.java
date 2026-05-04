package com.deepika.apibillingledger.service;

import com.deepika.apibillingledger.model.ApiKey;
import com.deepika.apibillingledger.model.User;
import com.deepika.apibillingledger.repository.ApiKeyRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.UUID;


@Service
public class ApiKeyService {
    @Autowired
    private ApiKeyRepository apiKeyRepository;
    @Autowired
    private PasswordEncoder passwordEncoder;

    public String createKeyForUser(User user, String keyName) {
        String randomPart = UUID.randomUUID().toString().replace("-", "");
        String plainKey = "sk_live_" + randomPart;

        ApiKey apiKey = new ApiKey();
        apiKey.setUser(user);
        apiKey.setName(keyName);
        apiKey.setPrefix("sk_live_"); // The constant part
        apiKey.setKeyHash(passwordEncoder.encode(plainKey)); // Securely hash it
        apiKey.setActive(true);
        apiKeyRepository.save(apiKey);
        return plainKey;
    }

    public String generateNewKeyForUser(User user) {
        String rawKey = "sk_live_" + UUID.randomUUID().toString().replace("-", "");

        ApiKey apiKey = new ApiKey();
        apiKey.setKeyHash(passwordEncoder.encode(rawKey));
        apiKey.setUser(user);
        apiKey.setName("Default Key");
        apiKey.setPrefix("sk_live_");
        apiKey.setActive(true);
        apiKey.setCreatedAt(LocalDateTime.now());
        apiKeyRepository.save(apiKey);

        return rawKey;
    }
}