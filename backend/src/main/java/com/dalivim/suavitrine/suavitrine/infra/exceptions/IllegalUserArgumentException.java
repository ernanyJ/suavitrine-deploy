package com.dalivim.suavitrine.suavitrine.infra.exceptions;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

@ResponseStatus(HttpStatus.BAD_REQUEST)
public class IllegalUserArgumentException extends RuntimeException {
    public IllegalUserArgumentException(String message) {
        super(message);
    }
}
