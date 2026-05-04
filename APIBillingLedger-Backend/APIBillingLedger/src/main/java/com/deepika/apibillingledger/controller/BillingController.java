package com.deepika.apibillingledger.controller;

import com.deepika.apibillingledger.model.UsageLog;
import com.deepika.apibillingledger.model.User;
import com.deepika.apibillingledger.repository.UsageLogRepository;
import com.deepika.apibillingledger.repository.UserRepository;
import com.deepika.apibillingledger.service.BillingService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/billing")
@RequiredArgsConstructor
public class BillingController {

    private final UsageLogRepository usageLogRepository;
    private final UserRepository userRepository;
    private final BillingService billingService;

    @GetMapping("/usage")
    public ResponseEntity<?> getMyUsage(@AuthenticationPrincipal UserDetails userDetails) {
        User user = userRepository.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new RuntimeException("User not found"));
        List<UsageLog> logs = usageLogRepository.findTop10ByUserIdOrderByTimestampDesc(user.getId());
        long totalRequests = usageLogRepository.countByUserId(user.getId());
        return ResponseEntity.ok(Map.of(
                "user", user.getEmail(),
                "totalRequests", totalRequests,
                "history", logs,
                "rate", 0.01
        ));
    }

    @PostMapping("/log-action")
    public ResponseEntity<?> logBillableAction(
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestBody Map<String, String> actionData) {

        User user = userRepository.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new RuntimeException("User not found"));

        billingService.processAction(
                user,
                actionData.get("method"),
                actionData.get("endpoint")
        );

        return ResponseEntity.ok("Action logged successfully");
    }

    @GetMapping("/my-bill")
    public ResponseEntity<?> getMyBill(@AuthenticationPrincipal UserDetails userDetails) {
        User user = userRepository.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new RuntimeException("User not found"));

        return ResponseEntity.ok(billingService.calculateCurrentInvoice(user));
    }

    @PostMapping("/pay")
    public ResponseEntity<?> payBill(@AuthenticationPrincipal UserDetails userDetails) throws Exception {
        User user = userRepository.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new RuntimeException("User not found"));

        Map<String, Object> invoice = billingService.calculateCurrentInvoice(user);
        BigDecimal amountOwed = (BigDecimal) invoice.get("amountOwed");
        double amount = amountOwed.doubleValue();

        if (amount <= 0) {
            return ResponseEntity.badRequest().body(Map.of("error", "No balance to pay."));
        }
        String checkoutUrl = billingService.createCheckoutSession(user, amount);

        return ResponseEntity.ok(Map.of("url", checkoutUrl));
    }
}