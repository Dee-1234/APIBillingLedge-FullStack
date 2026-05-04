package com.deepika.apibillingledger.service;

import com.deepika.apibillingledger.model.UsageLog;
import com.deepika.apibillingledger.model.User;
import com.deepika.apibillingledger.repository.UsageLogRepository;
import com.stripe.Stripe;
import com.stripe.model.checkout.Session;
import com.stripe.param.checkout.SessionCreateParams;
import com.stripe.param.checkout.SessionCreateParams.LineItem;
import com.stripe.param.checkout.SessionCreateParams.LineItem.PriceData;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import java.util.Map;
import lombok.RequiredArgsConstructor;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.LocalDateTime;


@Service
@RequiredArgsConstructor
public class BillingService {

    @Value("${stripe.api.key}")
    private String stripeSecretKey;

    private final UsageLogRepository usageLogRepository;

    private BigDecimal getRatePerRequest(String planType) {
        return switch (planType.toUpperCase()) {
            case "ENTERPRISE" -> new BigDecimal("0.005"); // Bulk discount
            case "PRO"        -> new BigDecimal("0.01");
            case "FREE"       -> new BigDecimal("0.05");  // Higher rate for free tier
            default           -> new BigDecimal("0.10");  // Pay-as-you-go
        };
    }

    public Map<String, Object> calculateCurrentInvoice(User user) {
        LocalDateTime startOfMonth = LocalDate.now().withDayOfMonth(1).atStartOfDay();

        long currentMonthRequests = usageLogRepository.countByUserAndTimestampAfter(user, startOfMonth);
        BigDecimal rate = getRatePerRequest(String.valueOf(user.getPlanType()));
        BigDecimal amountOwed = rate.multiply(BigDecimal.valueOf(currentMonthRequests));
        long softLimit = user.getPlanType().equals("FREE") ? 500 : 10000;
        double usagePercentage = (double) currentMonthRequests / softLimit * 100;

        return Map.of(
                "billingCycleStart", startOfMonth,
                "currentUsage", currentMonthRequests,
                "usageLimit", softLimit,
                "usagePercentage", Math.min(usagePercentage, 100.0), // Cap at 100 for UI bars
                "plan", user.getPlanType(),
                "amountOwed", amountOwed.setScale(2, RoundingMode.HALF_UP),
                "currency", "USD"
        );
    }

    public void processAction(User user, String actionType, String endpoint) {
        UsageLog log = new UsageLog();
        log.setUser(user);
        log.setMethod(actionType); // e.g., "COPY"
        log.setEndpoint(endpoint); // e.g., "/api/keys/secret"
        log.setTimestamp(LocalDateTime.now());

        usageLogRepository.save(log);
    }

    public String createCheckoutSession(User user, double amount) throws Exception {
        Stripe.apiKey = stripeSecretKey;
        long unitAmount = (long) (amount * 100);

        SessionCreateParams params = SessionCreateParams.builder()
                .setMode(SessionCreateParams.Mode.PAYMENT) // This resolves 'Mode'
                .setSuccessUrl("http://localhost:5173/dashboard?payment=success")
                .setCancelUrl("http://localhost:5173/dashboard?payment=cancel")
                .addLineItem(LineItem.builder().setQuantity(1L).setPriceData(PriceData.builder().setCurrency("usd")
                        .setUnitAmount(unitAmount).setProductData(PriceData.ProductData.builder()
                                .setName("API Usage Settlement - " + user.getPlanType())
                                .setDescription("Total usage-based charges for current cycle")
                                .build())
                        .build()).build())
                .build();

        Session session = Session.create(params);
        return session.getUrl();
    }
}
