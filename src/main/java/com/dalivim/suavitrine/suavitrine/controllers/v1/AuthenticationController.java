package com.dalivim.suavitrine.suavitrine.controllers.v1;

import com.dalivim.suavitrine.suavitrine.dtos.AuthenticationResponse;
import com.dalivim.suavitrine.suavitrine.dtos.LoginRequest;
import com.dalivim.suavitrine.suavitrine.dtos.RegisterRequest;
import com.dalivim.suavitrine.suavitrine.services.AuthenticationService;
import io.sentry.Sentry;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/auth")
@RequiredArgsConstructor
@Tag(name = "Autenticação", description = "Endpoints para registro e autenticação de usuários")
public class AuthenticationController {

    private final AuthenticationService authenticationService;

    @PostMapping("/register")
    @Operation(summary = "Registrar novo usuário", description = "Cria uma nova conta de usuário no sistema")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "201", description = "Usuário criado com sucesso"),
            @ApiResponse(responseCode = "400", description = "Dados inválidos ou usuário já existe")
    })
    public ResponseEntity<?> register(@Valid @RequestBody RegisterRequest request) {
        try {
            AuthenticationResponse response = authenticationService.register(request);
            return ResponseEntity.status(HttpStatus.CREATED).body(response);
        } catch (RuntimeException e) {
            Sentry.captureException(e);
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(new com.dalivim.suavitrine.suavitrine.dtos.ErrorResponse(
                            java.time.Instant.now(),
                            HttpStatus.BAD_REQUEST.value(),
                            HttpStatus.BAD_REQUEST.getReasonPhrase(),
                            e.getMessage(),
                            "/api/v1/auth/register"
                    ));
        }
    }

    @PostMapping("/login")
    @Operation(summary = "Login de usuário", description = "Autentica um usuário e retorna um token JWT")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Login realizado com sucesso"),
            @ApiResponse(responseCode = "401", description = "Email ou senha inválidos")
    })
    public ResponseEntity<?> login(@Valid @RequestBody LoginRequest request) {
        try {
            AuthenticationResponse response = authenticationService.login(request);
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            Sentry.captureException(e);
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(new com.dalivim.suavitrine.suavitrine.dtos.ErrorResponse(
                            java.time.Instant.now(),
                            HttpStatus.UNAUTHORIZED.value(),
                            HttpStatus.UNAUTHORIZED.getReasonPhrase(),
                            "Email ou senha inválidos",
                            "/api/v1/auth/login"
                    ));
        }
    }
}
