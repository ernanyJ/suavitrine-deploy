package com.dalivim.suavitrine.suavitrine.services.billing;

import java.nio.charset.StandardCharsets;
import java.security.InvalidKeyException;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.Base64;
import java.util.List;
import java.util.UUID;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.dalivim.suavitrine.suavitrine.dtos.BillingResponse;
import com.dalivim.suavitrine.suavitrine.dtos.CreateAbacateBilling;
import com.dalivim.suavitrine.suavitrine.dtos.CreateAbacateBillingResponse;
import com.dalivim.suavitrine.suavitrine.dtos.WebhookPayload;
import com.dalivim.suavitrine.suavitrine.entities.Store;
import com.dalivim.suavitrine.suavitrine.entities.StoreUser;
import com.dalivim.suavitrine.suavitrine.entities.billing.Billing;
import com.dalivim.suavitrine.suavitrine.entities.billing.PayingPlan;
import com.dalivim.suavitrine.suavitrine.entities.billing.PlanDuration;
import com.dalivim.suavitrine.suavitrine.infra.exceptions.ExternalServiceException;
import com.dalivim.suavitrine.suavitrine.infra.exceptions.IllegalUserArgumentException;
import com.dalivim.suavitrine.suavitrine.infra.exceptions.ObjectNotFoundException;
import com.dalivim.suavitrine.suavitrine.infra.security.JwtService;
import com.dalivim.suavitrine.suavitrine.repositories.StoreRepository;
import com.dalivim.suavitrine.suavitrine.repositories.StoreUserRepository;

import kong.unirest.core.Unirest;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

import com.dalivim.suavitrine.suavitrine.repositories.BillingRepository;
import com.fasterxml.jackson.databind.ObjectMapper;

@Slf4j
@Service
@RequiredArgsConstructor
public class AbacateBillingService implements IBillingService {

    private final JwtService jwtService;
    private final StoreRepository storeRepository;
    private final StoreUserRepository storeUserRepository;
    private final BillingRepository billingRepository;
    private final ObjectMapper objectMapper;

    @Value("${abacate.pay.return-url}")
    private String postPaymentReturnUrl;

    @Value("${abacate.pay.url}")
    private String abacatePayUrl;

    @Value("${abacate.pay.api-key}")
    private String abacateApiKey;

    @Value("${abacate.pay.webhook-secret}")
    private String webhookSecret;

    /**
     * Chave pública HMAC da AbacatePay para validação de assinatura de webhooks.
     * Fonte: https://docs.abacatepay.com/pages/webhooks
     */
    private static final String ABACATEPAY_PUBLIC_KEY = 
        "t9dXRhHHo3yDEj5pVDYz0frf7q6bMKyMRmxxCPIPp3RCplBfXRxqlC6ZpiWmOqj4L63qEaeUOtrCI8P0VMUgo6iIga2ri9ogaHFs0WIIywSMg0q7RmBfybe1E5XJcfC4IW3alNqym0tXoAKkzvfEjZxV6bE0oG2zJrNNYmUCKZyV0KZ3JS8Votf9EAWWYdiDkMkpbMdPggfh1EqHlVkMiTady6jOR3hyzGEHrIz2Ret0xHKMbiqkr9HS1JhNHDX9";

    public String getWebhookSecret() {
        return webhookSecret;
    }

    @Override
    @Transactional
    public BillingResponse createBillingRequest(UUID storeId, PayingPlan payingPlan, PlanDuration planDuration) {
        var user = jwtService.getCurrentAuthenticatedUser();

        Store store = storeRepository.findById(storeId)
                .orElseThrow(() -> new ObjectNotFoundException("Store not found"));

        var currentActivePlan = billingRepository.findCurrentActivePlan(store);

        if(currentActivePlan.isPresent()) {
            // TODO: permitir fazer upgrade de plano. Preço proporcional ao tempo restante.
            throw new RuntimeException("Current active plan is already in progress");
        }

        StoreUser payer = storeUserRepository.findByStoreAndUser(store, user)
                .orElseThrow(() -> new ObjectNotFoundException("Payer not found"));

        Instant expiresAt = Instant.now().plus(planDuration.getDuration(), ChronoUnit.DAYS);

        // Calcular preço baseado na duração
        // Para anual: preço mensal * 12 * 0.8 (desconto de 20%)
        // Para mensal: preço mensal
        int calculatedPrice;
        if (planDuration == PlanDuration.YEARLY) {
            // Aplicar desconto de 20% no plano anual
            calculatedPrice = (int) Math.round(payingPlan.getPrice() * 12 * 0.8);
        } else {
            calculatedPrice = payingPlan.getPrice();
        }

        Billing billing = Billing.builder()
                .store(store)
                .payer(payer)
                .payingPlan(payingPlan)
                .planDuration(planDuration)
                .price(calculatedPrice)
                .paidAt(null)
                .expiresAt(expiresAt)
                .createdAt(Instant.now())
                .build();

        // Salvar primeiro para obter o ID gerado pelo Hibernate
        billing = billingRepository.save(billing);

        var request = CreateAbacateBilling.builder()
                .frequency("ONE_TIME")
                .methods(List.of("PIX"))
                .products(List.of(createAbacateProduct(billing)))
                .customer(createAbacateCustomer(billing))
                .allowCoupons(true)
                .coupons(List.of("RRFULLSTACKDEVS"))
                .returnUrl(postPaymentReturnUrl)
                .completionUrl(postPaymentReturnUrl)
                .build();

        // aqui vamos criar o billing na abacate.
        var response = Unirest.post(abacatePayUrl + "/v1/billing/create")
                .header("Authorization", "Bearer " + abacateApiKey)
                .header("Content-Type", "application/json")
                .body(request)
                .asObject(CreateAbacateBillingResponse.class);

        if (!response.isSuccess()) {
            // Se falhar, remover o billing criado
            billingRepository.delete(billing);
            
            String errorMessage = "Falha ao criar billing na Abacate Pay";
            
            // Tenta obter o erro do DTO se o body foi parseado corretamente
            if (response.getBody() != null && response.getBody().error() != null) {
                errorMessage += ": " + response.getBody().error();
            } else if (response.getParsingError().isPresent()) {
                errorMessage += ": " + response.getParsingError().get().getMessage();
            } else {
                errorMessage += ": Status " + response.getStatus();
            }
            
            throw new ExternalServiceException(errorMessage);
        }

        var billingData = response.getBody().data();
        billing.setExternalId(billingData.id());
        billing.setPaymentUrl(billingData.url());
        
        // Atualizar o billing com os dados da Abacate
        billing = billingRepository.save(billing);

        return new BillingResponse(
                billing.getId(),
                billing.getPaymentUrl(),
                billing.getPrice(),
                billing.getPayingPlan(),
                billing.getPlanDuration(),
                billing.getExpiresAt(),
                billing.getExternalId()
        );
    }

    /**
     * Cria um produto na abacate para o billing.
     */
    private CreateAbacateBilling.Product createAbacateProduct(Billing billing) {

        var productName = "Plano " + billing.getPayingPlan().name() + " - " + billing.getPlanDuration().name() + " de "
                + billing.getStore().getName();

        return CreateAbacateBilling.Product.builder()
                .externalId(billing.getId().toString())
                .name(productName)
                .description(productName)
                .quantity(1)
                .price(billing.getPrice()) // Usar o preço calculado que já considera a duração e desconto
                .build();
    }

    private CreateAbacateBilling.Customer createAbacateCustomer(Billing billing) {
        var taxId = billing.getStore().getCnpj() != null ? billing.getStore().getCnpj() : billing.getPayer().getUser().getCpf();

        return CreateAbacateBilling.Customer.builder()
                .name(billing.getPayer().getUser().getName())
                .email(billing.getPayer().getUser().getEmail())
                .cellphone(billing.getStore().getPhoneNumber())
                .taxId(taxId)
                .build();
    }

    /**
     * Valida a assinatura HMAC-SHA256 do webhook.
     * Segue a especificação da AbacatePay: https://docs.abacatepay.com/pages/webhooks
     * 
     * @param rawBody Corpo bruto da requisição como string (UTF-8)
     * @param signatureFromHeader Assinatura recebida no header X-Webhook-Signature (Base64)
     * @return true se a assinatura é válida, false caso contrário
     */
    public boolean verifyAbacateSignature(String rawBody, String signatureFromHeader) {
        try {
            // Converter o corpo para bytes UTF-8
            byte[] bodyBytes = rawBody.getBytes(StandardCharsets.UTF_8);
            
            // Calcular HMAC-SHA256 usando a chave pública da AbacatePay
            Mac mac = Mac.getInstance("HmacSHA256");
            SecretKeySpec key = new SecretKeySpec(ABACATEPAY_PUBLIC_KEY.getBytes(StandardCharsets.UTF_8), "HmacSHA256");
            mac.init(key);
            byte[] hmacBytes = mac.doFinal(bodyBytes);
            
            // Codificar o resultado do HMAC em Base64
            String expectedSignature = Base64.getEncoder().encodeToString(hmacBytes);
    
            // Comparar usando timing-safe comparison
            // Ambas as assinaturas estão em Base64, comparamos os bytes decodificados
            byte[] expected = Base64.getDecoder().decode(expectedSignature);
            byte[] received = Base64.getDecoder().decode(signatureFromHeader);
    
            // Timing-safe comparison para prevenir timing attacks
            if (expected.length != received.length) {
                return false;
            }
            
            return MessageDigest.isEqual(expected, received);
        } catch (IllegalArgumentException e) {
            log.error("Erro ao decodificar assinatura Base64 do webhook: {}", e.getMessage());
            return false;
        } catch (NoSuchAlgorithmException | InvalidKeyException e) {
            log.error("Erro ao inicializar HMAC: {}", e.getMessage(), e);
            return false;
        } catch (Exception e) {
            log.error("Erro inesperado ao verificar assinatura do webhook: {}", e.getMessage(), e);
            return false;
        }
    }

    /**
     * Processa o webhook de pagamento da Abacate Pay.
     * Atualiza o campo paidAt do Billing quando o pagamento é confirmado.
     * 
     * @param webhookPayload Payload do webhook
     */
    @Transactional
    public void processWebhook(WebhookPayload webhookPayload) {
        log.info("Iniciando processamento de webhook. Evento: {}, ID: {}", 
                webhookPayload.event(), webhookPayload.id());
        
        // Validar que o evento é de pagamento confirmado
        if (!"billing.paid".equals(webhookPayload.event())) {
            log.debug("Webhook ignorado - evento não é billing.paid. Evento recebido: {}", webhookPayload.event());
            return;
        }
        log.debug("Evento validado: billing.paid");

        // Validar que o status do billing é PAID
        String billingStatus = webhookPayload.data().billing().status();
        if (!"PAID".equals(billingStatus)) {
            log.debug("Webhook ignorado - status do billing não é PAID. Status recebido: {}", billingStatus);
            return;
        }
        log.debug("Status do billing validado: PAID");

        // Buscar o billing pelo externalId (que está no products[0].externalId)
        var products = webhookPayload.data().billing().products();
        if (products == null || products.isEmpty()) {
            log.error("Webhook sem produtos no billing. Webhook ID: {}", webhookPayload.id());
            throw new IllegalUserArgumentException("Webhook sem produtos no billing");
        }

        // externalId na abacate = id na suavitrine, e vice-versa
        String externalId = products.get(0).externalId();
        if (externalId == null || externalId.isEmpty()) {
            log.error("ExternalId não encontrado no webhook. Webhook ID: {}", webhookPayload.id());
            throw new IllegalUserArgumentException("ExternalId não encontrado no webhook");
        }
        log.info("Buscando billing com externalId: {}", externalId);

        Billing billing = billingRepository.findById(UUID.fromString(externalId))
                .orElseThrow(() -> {
                    log.error("Billing não encontrado para externalId: {}", externalId);
                    return new ObjectNotFoundException("Billing não encontrado para externalId: " + externalId);
                });
        log.info("Billing encontrado. ID: {}, Store: {}, Plano: {}", 
                billing.getId(), billing.getStore().getId(), billing.getPayingPlan());

        // Verificar se já foi pago anteriormente
        if (billing.getPaidAt() != null) {
            log.info("Billing já foi processado anteriormente. Billing ID: {}, PaidAt: {}. Ignorando webhook.", 
                    billing.getId(), billing.getPaidAt());
            return;
        }

        // Obter cupons usados do webhook
        var couponsUsed = webhookPayload.data().billing().couponsUsed();
        String couponsUsedJson = null;
        if (couponsUsed != null && !couponsUsed.isEmpty()) {
            log.debug("Cupons usados encontrados no webhook: {}", couponsUsed);
            try {
                couponsUsedJson = objectMapper.writeValueAsString(couponsUsed);
                log.debug("Cupons serializados em JSON com sucesso");
            } catch (Exception e) {
                log.error("Erro ao serializar cupons usados em JSON: {}", e.getMessage(), e);
                couponsUsedJson = null;
            }
        } else {
            log.debug("Nenhum cupom usado encontrado no webhook");
        }

        // Atualizar o paidAt para NOW e salvar cupons usados
        Instant paidAt = Instant.now();
        billing.setPaidAt(paidAt);
        billing.setCouponsUsed(couponsUsedJson);
        billingRepository.save(billing);
        
        log.info("Billing atualizado com sucesso. Billing ID: {}, PaidAt: {}, Cupons: {}", 
                billing.getId(), paidAt, couponsUsedJson != null ? couponsUsedJson : "nenhum");
    }

}