package com.deepika.apibillingledger.service;

import com.deepika.apibillingledger.model.ApiKey;
import com.deepika.apibillingledger.model.UsageLog;
import com.deepika.apibillingledger.model.User;
import com.deepika.apibillingledger.repository.UsageLogRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;


@Service
@RequiredArgsConstructor
public class UsageService {
    private final UsageLogRepository usageLogRepository;

    @Transactional
    public void logUsage(User user, ApiKey apiKey, String endpoint, String method) {
        UsageLog log = UsageLog.builder()
                .endpoint(endpoint)
                .method(method)
                .timestamp(LocalDateTime.now())
                .user(user)
                .apiKey(apiKey)
                .build();
        usageLogRepository.save(log);
    }
}