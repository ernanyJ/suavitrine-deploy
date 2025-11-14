package com.dalivim.suavitrine.suavitrine.infra.security.handlers;

import com.dalivim.suavitrine.suavitrine.dtos.ErrorResponse;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.web.AuthenticationEntryPoint;

import java.io.IOException;
import java.time.Instant;

@Slf4j
public class CustomAuthenticationEntryPoint implements AuthenticationEntryPoint {

    private final ObjectMapper objectMapper;

    public CustomAuthenticationEntryPoint(ObjectMapper objectMapper) {
        this.objectMapper = objectMapper;
    }

    @Override
    public void commence(
            HttpServletRequest request,
            HttpServletResponse response,
            AuthenticationException authException) throws IOException {

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

            response.setStatus(HttpStatus.NOT_FOUND.value());
            response.setContentType(MediaType.APPLICATION_JSON_VALUE);
            response.getWriter().write(objectMapper.writeValueAsString(error));
            return;
        }

        // Caso contrário, retorna 401 (Unauthorized) normal
        ErrorResponse error = new ErrorResponse(
                Instant.now(),
                HttpStatus.UNAUTHORIZED.value(),
                HttpStatus.UNAUTHORIZED.getReasonPhrase(),
                "Credenciais inválidas ou token expirado",
                requestPath);

        response.setStatus(HttpStatus.UNAUTHORIZED.value());
        response.setContentType(MediaType.APPLICATION_JSON_VALUE);
        response.getWriter().write(objectMapper.writeValueAsString(error));
    }
}
