package com.dalivim.suavitrine.suavitrine.dtos;

import com.fasterxml.jackson.annotation.JsonInclude;
import io.swagger.v3.oas.annotations.media.Schema;

import java.time.Instant;
import java.util.List;

@JsonInclude(JsonInclude.Include.NON_NULL)
@Schema(description = "Resposta de erro padronizada da API")
public record ErrorResponse(
        @Schema(description = "Timestamp do erro", example = "2024-01-20T10:30:00Z")
        Instant timestamp,
        
        @Schema(description = "Código de status HTTP", example = "400")
        int status,
        
        @Schema(description = "Descrição do status HTTP", example = "Bad Request")
        String error,
        
        @Schema(description = "Mensagem de erro", example = "Dados inválidos fornecidos")
        String message,
        
        @Schema(description = "Caminho da requisição", example = "/api/v1/products")
        String path,
        
        @Schema(description = "Lista de erros de validação")
        List<ValidationError> validationErrors
) {
    public ErrorResponse(Instant timestamp, int status, String error, String message, String path) {
        this(timestamp, status, error, message, path, null);
    }

    @Schema(description = "Detalhes de erro de validação de campo")
    public record ValidationError(
            @Schema(description = "Nome do campo", example = "email")
            String field,
            
            @Schema(description = "Valor rejeitado", example = "invalid-email")
            Object rejectedValue,
            
            @Schema(description = "Mensagem de erro", example = "Email deve ser válido")
            String message
    ) {}
}

