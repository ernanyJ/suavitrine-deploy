package com.dalivim.suavitrine.suavitrine.infra.exceptions;

import com.dalivim.suavitrine.suavitrine.dtos.ErrorResponse;
import io.jsonwebtoken.ExpiredJwtException;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.core.AuthenticationException;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.method.annotation.MethodArgumentTypeMismatchException;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.dao.DataAccessException;
import org.springframework.web.servlet.NoHandlerFoundException;
import org.springframework.security.access.AccessDeniedException;

import jakarta.persistence.PersistenceException;
import org.hibernate.exception.ConstraintViolationException;

import lombok.extern.slf4j.Slf4j;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

@Slf4j
@RestControllerAdvice
public class GlobalExceptionHandler {

        /**
         * Trata exceções de objeto não encontrado (404)
         */
        @ExceptionHandler(ObjectNotFoundException.class)
        public ResponseEntity<ErrorResponse> handleObjectNotFoundException(
                        ObjectNotFoundException ex,
                        HttpServletRequest request) {
                ErrorResponse error = new ErrorResponse(
                                Instant.now(),
                                HttpStatus.NOT_FOUND.value(),
                                HttpStatus.NOT_FOUND.getReasonPhrase(),
                                ex.getMessage(),
                                request.getRequestURI());
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(error);
        }

        /**
         * Trata exceções de permissão insuficiente (403)
         */
        @ExceptionHandler(InsufficientPermissionException.class)
        public ResponseEntity<ErrorResponse> handleInsufficientPermissionException(
                        InsufficientPermissionException ex,
                        HttpServletRequest request) {
                ErrorResponse error = new ErrorResponse(
                                Instant.now(),
                                HttpStatus.FORBIDDEN.value(),
                                HttpStatus.FORBIDDEN.getReasonPhrase(),
                                ex.getMessage(),
                                request.getRequestURI());
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body(error);
        }

        /**
         * Trata rotas não encontradas (404)
         */
        @ExceptionHandler(NoHandlerFoundException.class)
        public ResponseEntity<ErrorResponse> handleNoHandlerFoundException(
                        NoHandlerFoundException ex,
                        HttpServletRequest request) {
                ErrorResponse error = new ErrorResponse(
                                Instant.now(),
                                HttpStatus.NOT_FOUND.value(),
                                HttpStatus.NOT_FOUND.getReasonPhrase(),
                                "Rota não encontrada",
                                request.getRequestURI());
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(error);
        }

        /**
         * Trata AccessDeniedException do Spring Security
         * Se for uma rota não mapeada, retorna 404 ao invés de 403
         */
        @ExceptionHandler(AccessDeniedException.class)
        public ResponseEntity<ErrorResponse> handleAccessDeniedException(
                        AccessDeniedException ex,
                        HttpServletRequest request) {
                // Verifica se a rota começa com /api/v1/ para determinar se é uma rota da API
                String requestPath = request.getRequestURI();

                // Se não for uma rota da API conhecida, trata como 404
                if (!requestPath.startsWith("/api/v1/") &&
                                !requestPath.startsWith("/v3/api-docs") &&
                                !requestPath.startsWith("/swagger-ui") &&
                                !requestPath.startsWith("/actuator") &&
                                !requestPath.equals("/error")) {
                        ErrorResponse error = new ErrorResponse(
                                        Instant.now(),
                                        HttpStatus.NOT_FOUND.value(),
                                        HttpStatus.NOT_FOUND.getReasonPhrase(),
                                        "Rota não encontrada",
                                        requestPath);
                        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(error);
                }

                // Caso contrário, retorna 403 (Forbidden) normal
                ErrorResponse error = new ErrorResponse(
                                Instant.now(),
                                HttpStatus.FORBIDDEN.value(),
                                HttpStatus.FORBIDDEN.getReasonPhrase(),
                                "Acesso negado",
                                requestPath);
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body(error);
        }

        /**
         * Trata exceções de argumentos ilegais (400)
         */
        @ExceptionHandler(IllegalUserArgumentException.class)
        public ResponseEntity<ErrorResponse> handleIllegalUserArgumentException(
                        IllegalUserArgumentException ex,
                        HttpServletRequest request) {
                ErrorResponse error = new ErrorResponse(
                                Instant.now(),
                                HttpStatus.BAD_REQUEST.value(),
                                HttpStatus.BAD_REQUEST.getReasonPhrase(),
                                ex.getMessage(),
                                request.getRequestURI());
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
        }

        /**
         * Trata exceções de serviços externos (502)
         */
        @ExceptionHandler(ExternalServiceException.class)
        public ResponseEntity<ErrorResponse> handleExternalServiceException(
                        ExternalServiceException ex,
                        HttpServletRequest request) {
                ErrorResponse error = new ErrorResponse(
                                Instant.now(),
                                HttpStatus.BAD_GATEWAY.value(),
                                HttpStatus.BAD_GATEWAY.getReasonPhrase(),
                                ex.getMessage(),
                                request.getRequestURI());
                return ResponseEntity.status(HttpStatus.BAD_GATEWAY).body(error);
        }

        /**
         * Trata exceções de validação do Bean Validation (@Valid)
         */
        @ExceptionHandler(MethodArgumentNotValidException.class)
        public ResponseEntity<ErrorResponse> handleMethodArgumentNotValidException(
                        MethodArgumentNotValidException ex,
                        HttpServletRequest request) {
                List<ErrorResponse.ValidationError> validationErrors = new ArrayList<>();

                ex.getBindingResult().getAllErrors().forEach(error -> {
                        String fieldName = ((FieldError) error).getField();
                        Object rejectedValue = ((FieldError) error).getRejectedValue();
                        String message = error.getDefaultMessage();
                        validationErrors.add(new ErrorResponse.ValidationError(fieldName, rejectedValue, message));
                });

                ErrorResponse error = new ErrorResponse(
                                Instant.now(),
                                HttpStatus.BAD_REQUEST.value(),
                                HttpStatus.BAD_REQUEST.getReasonPhrase(),
                                "Erro de validação nos campos da requisição",
                                request.getRequestURI(),
                                validationErrors);
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
        }

        /**
         * Trata exceções de autenticação (401)
         */
        @ExceptionHandler({ AuthenticationException.class, BadCredentialsException.class })
        public ResponseEntity<ErrorResponse> handleAuthenticationException(
                        Exception ex,
                        HttpServletRequest request) {
                ErrorResponse error = new ErrorResponse(
                                Instant.now(),
                                HttpStatus.UNAUTHORIZED.value(),
                                HttpStatus.UNAUTHORIZED.getReasonPhrase(),
                                "Credenciais inválidas ou token expirado",
                                request.getRequestURI());
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(error);
        }

        /**
         * Trata exceções de JSON malformado
         */
        @ExceptionHandler(HttpMessageNotReadableException.class)
        public ResponseEntity<ErrorResponse> handleHttpMessageNotReadableException(
                        HttpMessageNotReadableException ex,
                        HttpServletRequest request) {
                // Log detalhado internamente, mas mensagem genérica para o cliente
                log.debug("JSON malformado recebido: {}", ex.getMostSpecificCause().getMessage());

                ErrorResponse error = new ErrorResponse(
                                Instant.now(),
                                HttpStatus.BAD_REQUEST.value(),
                                HttpStatus.BAD_REQUEST.getReasonPhrase(),
                                "JSON malformado ou inválido",
                                request.getRequestURI());
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
        }

        /**
         * Trata exceções de tipo de argumento incompatível (ex: UUID inválido)
         */
        @ExceptionHandler(MethodArgumentTypeMismatchException.class)
        public ResponseEntity<ErrorResponse> handleMethodArgumentTypeMismatchException(
                        MethodArgumentTypeMismatchException ex,
                        HttpServletRequest request) {
                String message = String.format(
                                "Parâmetro '%s' com valor '%s' não pôde ser convertido para o tipo %s",
                                ex.getName(),
                                ex.getValue(),
                                ex.getRequiredType() != null ? ex.getRequiredType().getSimpleName() : "desconhecido");

                ErrorResponse error = new ErrorResponse(
                                Instant.now(),
                                HttpStatus.BAD_REQUEST.value(),
                                HttpStatus.BAD_REQUEST.getReasonPhrase(),
                                message,
                                request.getRequestURI());
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
        }

        /**
         * Trata exceções de argumento ilegal genérico
         */
        @ExceptionHandler(IllegalArgumentException.class)
        public ResponseEntity<ErrorResponse> handleIllegalArgumentException(
                        IllegalArgumentException ex,
                        HttpServletRequest request) {
                ErrorResponse error = new ErrorResponse(
                                Instant.now(),
                                HttpStatus.BAD_REQUEST.value(),
                                HttpStatus.BAD_REQUEST.getReasonPhrase(),
                                ex.getMessage(),
                                request.getRequestURI());
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
        }

        /**
         * Trata exceções de violação de integridade de dados do banco (constraints, NOT
         * NULL, etc.)
         */
        @ExceptionHandler(DataIntegrityViolationException.class)
        public ResponseEntity<ErrorResponse> handleDataIntegrityViolationException(
                        DataIntegrityViolationException ex,
                        HttpServletRequest request) {
                // Log do erro completo para debug interno (não expor ao cliente)
                log.error("Violação de integridade de dados: {}", ex.getMessage(), ex);

                // Determinar mensagem amigável baseada no tipo de constraint violado
                String userMessage = "Erro ao processar a operação. Verifique se os dados fornecidos estão corretos.";

                Throwable rootCause = ex.getRootCause();
                if (rootCause != null) {
                        String rootCauseMessage = rootCause.getMessage();
                        if (rootCauseMessage != null) {
                                // Detectar tipos comuns de violação sem expor detalhes técnicos
                                if (rootCauseMessage.contains("violates not-null constraint")) {
                                        userMessage = "Campos obrigatórios não foram preenchidos corretamente.";
                                } else if (rootCauseMessage.contains("violates unique constraint") ||
                                                rootCauseMessage.contains("duplicate key value")) {
                                        userMessage = "Já existe um registro com essas informações.";
                                } else if (rootCauseMessage.contains("violates foreign key constraint") ||
                                                rootCauseMessage.contains("foreign key violation")) {
                                        userMessage = "A operação não pode ser concluída devido a referências inválidas.";
                                }
                        }
                }

                ErrorResponse error = new ErrorResponse(
                                Instant.now(),
                                HttpStatus.BAD_REQUEST.value(),
                                HttpStatus.BAD_REQUEST.getReasonPhrase(),
                                userMessage,
                                request.getRequestURI());
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
        }

        /**
         * Trata exceções genéricas de acesso a dados (JPA/Hibernate)
         */
        @ExceptionHandler({ PersistenceException.class, DataAccessException.class })
        public ResponseEntity<ErrorResponse> handlePersistenceException(
                        Exception ex,
                        HttpServletRequest request) {
                // Log do erro completo para debug interno
                log.error("Erro de persistência de dados: {}", ex.getMessage(), ex);

                ErrorResponse error = new ErrorResponse(
                                Instant.now(),
                                HttpStatus.BAD_REQUEST.value(),
                                HttpStatus.BAD_REQUEST.getReasonPhrase(),
                                "Erro ao processar a operação no banco de dados",
                                request.getRequestURI());
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
        }

        /**
         * Trata exceções de violação de constraints do Hibernate
         */
        @ExceptionHandler(ConstraintViolationException.class)
        public ResponseEntity<ErrorResponse> handleConstraintViolationException(
                        ConstraintViolationException ex,
                        HttpServletRequest request) {
                // Log do erro completo para debug interno
                log.error("Violação de constraint do Hibernate: {}", ex.getMessage(), ex);

                ErrorResponse error = new ErrorResponse(
                                Instant.now(),
                                HttpStatus.BAD_REQUEST.value(),
                                HttpStatus.BAD_REQUEST.getReasonPhrase(),
                                "Os dados fornecidos violam regras de validação do banco de dados",
                                request.getRequestURI());
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
        }

        /**
         * Trata RuntimeException genérica
         * Apenas se não for uma exceção de banco de dados já tratada
         */
        @ExceptionHandler(RuntimeException.class)
        public ResponseEntity<ErrorResponse> handleRuntimeException(
                        RuntimeException ex,
                        HttpServletRequest request) {
                // Se a causa raiz for uma exceção de banco de dados, tratar genericamente
                Throwable cause = ex.getCause();
                if (cause instanceof DataIntegrityViolationException ||
                                cause instanceof PersistenceException ||
                                cause instanceof DataAccessException ||
                                cause instanceof ConstraintViolationException) {
                        // Log interno completo
                        log.error("Erro de runtime com causa de banco de dados: {}", ex.getMessage(), ex);

                        ErrorResponse error = new ErrorResponse(
                                        Instant.now(),
                                        HttpStatus.BAD_REQUEST.value(),
                                        HttpStatus.BAD_REQUEST.getReasonPhrase(),
                                        "Erro ao processar a operação no banco de dados",
                                        request.getRequestURI());
                        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
                }

                // Log interno completo, mas mensagem genérica para o cliente
                log.error("Erro de runtime: {}", ex.getMessage(), ex);

                ErrorResponse error = new ErrorResponse(
                                Instant.now(),
                                HttpStatus.INTERNAL_SERVER_ERROR.value(),
                                HttpStatus.INTERNAL_SERVER_ERROR.getReasonPhrase(),
                                "Ocorreu um erro inesperado no servidor",
                                request.getRequestURI());
                return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }

        /**
         * Trata todas as outras exceções não capturadas (500)
         */
        @ExceptionHandler(Exception.class)
        public ResponseEntity<ErrorResponse> handleGenericException(
                        Exception ex,
                        HttpServletRequest request) {
                // Log completo para debug interno, mas não expor ao cliente
                log.error("Erro não tratado: {}", ex.getMessage(), ex);

                ErrorResponse error = new ErrorResponse(
                                Instant.now(),
                                HttpStatus.INTERNAL_SERVER_ERROR.value(),
                                HttpStatus.INTERNAL_SERVER_ERROR.getReasonPhrase(),
                                "Ocorreu um erro inesperado no servidor",
                                request.getRequestURI());
                return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }

        @ExceptionHandler(ExpiredJwtException.class)
        public ResponseEntity<ErrorResponse> handleExpiredJwtException(
                        ExpiredJwtException ex,
                        HttpServletRequest request) {
                ErrorResponse error = new ErrorResponse(
                                Instant.now(),
                                HttpStatus.UNAUTHORIZED.value(),
                                HttpStatus.UNAUTHORIZED.getReasonPhrase(),
                                "Token JWT expirado",
                                request.getRequestURI());
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(error);
        }
}
