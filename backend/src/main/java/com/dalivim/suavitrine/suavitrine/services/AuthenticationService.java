package com.dalivim.suavitrine.suavitrine.services;

import com.dalivim.suavitrine.suavitrine.dtos.AuthenticationResponse;
import com.dalivim.suavitrine.suavitrine.dtos.LoginRequest;
import com.dalivim.suavitrine.suavitrine.dtos.RegisterRequest;
import com.dalivim.suavitrine.suavitrine.entities.User;
import com.dalivim.suavitrine.suavitrine.infra.security.JwtService;
import com.dalivim.suavitrine.suavitrine.repositories.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class AuthenticationService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final AuthenticationManager authenticationManager;

    public AuthenticationResponse register(RegisterRequest request) {
        // Verificar se o email já está em uso
        if (userRepository.existsByEmail(request.email())) {
            throw new RuntimeException("Email já está em uso");
        }

        // Criar novo usuário
        var user = User.builder()
                .name(request.name())
                .email(request.email())
                .password(passwordEncoder.encode(request.password()))
                .build();

        userRepository.save(user);

        // Gerar token JWT
        Map<String, Object> extraClaims = new HashMap<>();
        var jwtToken = jwtService.generateToken(extraClaims, user);

        return new AuthenticationResponse(jwtToken, user.getId(), user.getEmail(), user.getName());
    }

    public AuthenticationResponse login(LoginRequest request) {
        // Autenticar usuário
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        request.email(),
                        request.password()
                )
        );

        // Buscar usuário
        var user = userRepository.findByEmail(request.email())
                .orElseThrow(() -> new RuntimeException("Usuário não encontrado"));

        // Gerar token JWT
        Map<String, Object> extraClaims = new HashMap<>();
        var jwtToken = jwtService.generateToken(extraClaims, user);

        return new AuthenticationResponse(jwtToken, user.getId(), user.getEmail(), user.getName());
    }

}

