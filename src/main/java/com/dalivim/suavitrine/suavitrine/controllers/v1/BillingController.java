package com.dalivim.suavitrine.suavitrine.controllers.v1;

import java.io.IOException;
import java.util.stream.Collectors;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.dalivim.suavitrine.suavitrine.dtos.BillingResponse;
import com.dalivim.suavitrine.suavitrine.dtos.CreateBillingRequest;
import com.dalivim.suavitrine.suavitrine.dtos.WebhookPayload;
import com.dalivim.suavitrine.suavitrine.infra.exceptions.IllegalUserArgumentException;
import com.dalivim.suavitrine.suavitrine.services.billing.AbacateBillingService;
import com.dalivim.suavitrine.suavitrine.services.billing.IBillingService;
import com.fasterxml.jackson.databind.ObjectMapper;
import io.sentry.Sentry;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

import java.util.UUID;

@Slf4j
@RestController
@RequiredArgsConstructor
@Tag(name = "Faturamento", description = "Gerenciamento de faturamento e planos")
@RequestMapping("/api/v1/billing")
public class BillingController {

    private final IBillingService billingService;
    private final AbacateBillingService abacateBillingService;
    private final ObjectMapper objectMapper;

    /**
     * Cria uma nova solicitação de faturamento
     */
    @Operation(summary = "Criar solicitação de faturamento", description = "Cria uma nova solicitação de faturamento para um plano da loja")
    @PostMapping("/{storeId}")
    public ResponseEntity<BillingResponse> createBillingRequest(
            @PathVariable UUID storeId,
            @RequestBody CreateBillingRequest request
    ) {
        BillingResponse response = billingService.createBillingRequest(
                storeId,
                request.payingPlan(),
                request.planDuration(),
                request.taxId()
        );
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    /**
     * Endpoint para receber webhooks da Abacate Pay
     */
    @Operation(summary = "Webhook da Abacate Pay", description = "Recebe notificações de pagamento da Abacate Pay", hidden = true)
    @PostMapping("/webhook")
    public ResponseEntity<Void> handleWebhook(
            HttpServletRequest request,
            @RequestParam(name = "webhookSecret") String webhookSecretParam
    ) {
        log.info("Webhook recebido da Abacate Pay. IP: {}, User-Agent: {}", 
                request.getRemoteAddr(), request.getHeader("User-Agent"));
        
        try {
            // Ler o corpo bruto da requisição do InputStream
            log.debug("Lendo corpo bruto da requisição");
            String rawBody;
            try (var reader = new java.io.BufferedReader(
                    new java.io.InputStreamReader(request.getInputStream(), java.nio.charset.StandardCharsets.UTF_8))) {
                rawBody = reader.lines().collect(Collectors.joining("\n"));
            }
            log.debug("Corpo da requisição lido. Tamanho: {} caracteres", rawBody.length());

            // Validar webhookSecret
            log.debug("Validando webhookSecret");
            if (!abacateBillingService.getWebhookSecret().equals(webhookSecretParam)) {
                log.warn("Webhook rejeitado: webhookSecret inválido. IP: {}", request.getRemoteAddr());
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
            }
            log.debug("webhookSecret validado com sucesso");

            // Validar assinatura HMAC
            String signature = request.getHeader("X-Webhook-Signature");
            if (signature == null || signature.isEmpty()) {
                log.warn("Webhook rejeitado: header X-Webhook-Signature não encontrado ou vazio. IP: {}", 
                        request.getRemoteAddr());
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
            }
            log.debug("Header X-Webhook-Signature encontrado");

            if (!abacateBillingService.verifyAbacateSignature(rawBody, signature)) {
                log.warn("Webhook rejeitado: assinatura HMAC inválida. IP: {}", request.getRemoteAddr());
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
            }
            log.info("Assinatura HMAC validada com sucesso");

            // Parse do JSON após validação
            log.debug("Fazendo parse do payload JSON");
            WebhookPayload webhookPayload = objectMapper.readValue(rawBody, WebhookPayload.class);
            log.info("Payload parseado com sucesso. Webhook ID: {}, Evento: {}", 
                    webhookPayload.id(), webhookPayload.event());

            // Processar o webhook
            log.debug("Iniciando processamento do webhook");
            abacateBillingService.processWebhook(webhookPayload);
            log.info("Webhook processado com sucesso. Webhook ID: {}", webhookPayload.id());

            return ResponseEntity.ok().build();
        } catch (IOException e) {
            Sentry.captureException(e);
            log.error("Erro de IO ao processar webhook: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
        } catch (IllegalUserArgumentException e) {
            Sentry.captureException(e);
            log.error("Argumento inválido no webhook: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
        } catch (Exception e) {
            Sentry.captureException(e);
            log.error("Erro inesperado ao processar webhook: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
}

