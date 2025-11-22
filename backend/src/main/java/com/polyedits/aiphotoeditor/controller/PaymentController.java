package com.polyedits.aiphotoeditor.controller;

import com.polyedits.aiphotoeditor.dto.PaymentRequest;
import com.polyedits.aiphotoeditor.dto.PaymentResponse;
import com.polyedits.aiphotoeditor.model.User;
import com.polyedits.aiphotoeditor.repository.UserRepository;
import com.stripe.Stripe;
import com.stripe.exception.StripeException;
import com.stripe.model.checkout.Session;
import com.stripe.param.checkout.SessionCreateParams;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/payment")
public class PaymentController {

    @Value("${stripe.api.key}")
    private String stripeApiKey;

    @Value("${stripe.success.url}")
    private String successUrl;

    @Value("${stripe.cancel.url}")
    private String cancelUrl;

    @Autowired
    private UserRepository userRepository;

    // Credit packages: credits -> price in cents
    private static final Map<Integer, Long> CREDIT_PACKAGES = new HashMap<>() {{
        put(500, 1000L);    // $10.00
        put(2000, 3000L);   // $30.00
        put(5000, 7000L);   // $70.00
        put(10000, 10000L); // $100.00
    }};

    @PostMapping("/create-checkout-session")
    public ResponseEntity<?> createCheckoutSession(@RequestBody PaymentRequest request) {
        try {
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            if (authentication == null || !authentication.isAuthenticated()) {
                return ResponseEntity.status(401).body(new PaymentResponse(false, null, "User not authenticated"));
            }

            String username = authentication.getName();
            User user = userRepository.findByUsername(username)
                    .orElseThrow(() -> new RuntimeException("User not found"));

            Integer credits = request.getCredits();
            Long priceInCents = CREDIT_PACKAGES.get(credits);

            if (priceInCents == null) {
                return ResponseEntity.badRequest()
                        .body(new PaymentResponse(false, null, "Invalid credit package"));
            }

            Stripe.apiKey = stripeApiKey;

            SessionCreateParams params = SessionCreateParams.builder()
                    .setMode(SessionCreateParams.Mode.PAYMENT)
                    .setSuccessUrl(successUrl + "?session_id={CHECKOUT_SESSION_ID}")
                    .setCancelUrl(cancelUrl)
                    .addLineItem(
                            SessionCreateParams.LineItem.builder()
                                    .setQuantity(1L)
                                    .setPriceData(
                                            SessionCreateParams.LineItem.PriceData.builder()
                                                    .setCurrency("usd")
                                                    .setUnitAmount(priceInCents)
                                                    .setProductData(
                                                            SessionCreateParams.LineItem.PriceData.ProductData.builder()
                                                                    .setName(credits + " Credits")
                                                                    .setDescription("AI Photo Editor Credits - Generate " + (credits / 10) + " images")
                                                                    .build()
                                                    )
                                                    .build()
                                    )
                                    .build()
                    )
                    .putMetadata("userId", user.getId().toString())
                    .putMetadata("credits", credits.toString())
                    .putMetadata("username", username)
                    .build();

            Session session = Session.create(params);

            return ResponseEntity.ok(new PaymentResponse(true, session.getUrl(), "Checkout session created"));
        } catch (StripeException e) {
            return ResponseEntity.internalServerError()
                    .body(new PaymentResponse(false, null, "Stripe error: " + e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.internalServerError()
                    .body(new PaymentResponse(false, null, "Error creating checkout session: " + e.getMessage()));
        }
    }

    @PostMapping("/webhook")
    public ResponseEntity<String> handleWebhook(@RequestBody String payload, @RequestHeader("Stripe-Signature") String sigHeader) {
        // Stripe webhook handling - will be implemented after Stripe account setup
        // This endpoint will handle successful payment confirmations and add credits to user accounts
        
        try {
            // TODO: Verify webhook signature
            // TODO: Parse event
            // TODO: Handle checkout.session.completed event
            // TODO: Add credits to user account
            // TODO: Set user.paid = true
            
            return ResponseEntity.ok("Webhook received");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Webhook error: " + e.getMessage());
        }
    }

    @GetMapping("/verify-session")
    public ResponseEntity<?> verifySession(@RequestParam String sessionId) {
        try {
            Stripe.apiKey = stripeApiKey;
            Session session = Session.retrieve(sessionId);

            if ("paid".equals(session.getPaymentStatus())) {
                // Get user from metadata
                String userId = session.getMetadata().get("userId");
                String creditsStr = session.getMetadata().get("credits");

                User user = userRepository.findById(Long.parseLong(userId))
                        .orElseThrow(() -> new RuntimeException("User not found"));

                Integer credits = Integer.parseInt(creditsStr);
                user.setCredits(user.getCredits() + credits);
                user.setPaid(true);
                userRepository.save(user);

                Map<String, Object> response = new HashMap<>();
                response.put("success", true);
                response.put("credits", user.getCredits());
                response.put("message", "Payment successful! " + credits + " credits added.");

                return ResponseEntity.ok(response);
            }

            return ResponseEntity.badRequest().body(Map.of("success", false, "message", "Payment not completed"));
        } catch (StripeException e) {
            return ResponseEntity.internalServerError()
                    .body(Map.of("success", false, "message", "Stripe error: " + e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.internalServerError()
                    .body(Map.of("success", false, "message", "Error verifying session: " + e.getMessage()));
        }
    }
}
