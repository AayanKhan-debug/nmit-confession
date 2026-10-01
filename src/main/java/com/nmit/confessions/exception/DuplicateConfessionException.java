package com.nmit.confessions.exception;

public class DuplicateConfessionException extends RuntimeException {
    public DuplicateConfessionException(String message) {
        super(message);
    }
}
