package com.deepika.apibillingledger.security;

import com.deepika.apibillingledger.model.ApiKey;
import com.deepika.apibillingledger.model.UsageLog;
import com.deepika.apibillingledger.repository.ApiKeyRepository;
import com.deepika.apibillingledger.repository.UsageLogRepository;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Component
@RequiredArgsConstructor
public class ApiGatewayFilter extends OncePerRequestFilter {
    private final ApiKeyRepository apiKeyRepository;
    private final UsageLogRepository usageLogRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {

        String path = request.getServletPath();
        if (!path.startsWith("/api/v1/external")) {
            filterChain.doFilter(request, response);
            return;
        }

        String apiKey = request.getHeader("X-API-KEY");
        if (apiKey == null || apiKey.length() < 10) {
            response.sendError(HttpServletResponse.SC_UNAUTHORIZED, "API Key is missing or invalid format");
            return;
        }

        String prefix = apiKey.substring(0, 8);

        Optional<ApiKey> matchedKey = apiKeyRepository.findByPrefixWithUser(prefix).stream()
                .filter(k -> k.isActive() && passwordEncoder.matches(apiKey, k.getKeyHash()))
                .findFirst();

        if (matchedKey.isPresent()) {
            ApiKey validKey = matchedKey.get();
            UsernamePasswordAuthenticationToken auth = new UsernamePasswordAuthenticationToken(
                    validKey.getUser().getEmail(),
                    null,
                    List.of(new SimpleGrantedAuthority("ROLE_" + validKey.getUser().getRole().name()))
            );
            SecurityContextHolder.getContext().setAuthentication(auth);

            UsageLog log = UsageLog.builder()
                    .endpoint(path)
                    .method(request.getMethod())
                    .timestamp(LocalDateTime.now())
                    .user(validKey.getUser())
                    .apiKey(validKey)
                    .build();
            System.out.println("DEBUG: Saving usage log for user: " + validKey.getUser().getEmail());
            usageLogRepository.save(log);

            filterChain.doFilter(request, response);
        } else {
            response.sendError(HttpServletResponse.SC_UNAUTHORIZED, "Invalid or Inactive API Key");
        }
    }

    @Override
    protected boolean shouldNotFilter(HttpServletRequest request) {
        // Skip this filter for internal auth routes (JWT handled elsewhere)
        return request.getServletPath().startsWith("/api/auth/");
    }
}