package com.cashtrack.backend.exception;

import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.time.OffsetDateTime;
import java.util.List;

@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(ResourceNotFoundException.class)
    public ResponseEntity<ErrorResponse> handleResourceNotFound(
            ResourceNotFoundException ex, HttpServletRequest request) {

        return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(buildError(HttpStatus.NOT_FOUND, ex.getMessage(), request.getRequestURI(), null));
    }

    @ExceptionHandler(DuplicateResourceException.class)
    public ResponseEntity<ErrorResponse> handleDuplicateResource(
            DuplicateResourceException ex, HttpServletRequest request) {

        return ResponseEntity.status(HttpStatus.CONFLICT)
                .body(buildError(HttpStatus.CONFLICT, ex.getMessage(), request.getRequestURI(), null));
    }

    @ExceptionHandler(CategoryInUseException.class)
    public ResponseEntity<ErrorResponse> handleCategoryInUse(
            CategoryInUseException ex, HttpServletRequest request) {

        return ResponseEntity.status(HttpStatus.CONFLICT)
                .body(buildError(HttpStatus.CONFLICT, ex.getMessage(), request.getRequestURI(), null));
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ErrorResponse> handleValidation(
            MethodArgumentNotValidException ex, HttpServletRequest request) {

        List<ErrorResponse.ValidationError> errors = ex.getBindingResult()
                .getFieldErrors()
                .stream()
                .map(fe -> new ErrorResponse.ValidationError(fe.getField(), fe.getDefaultMessage()))
                .toList();

        ErrorResponse body = buildError(HttpStatus.BAD_REQUEST, "Validation failed", request.getRequestURI(), errors);
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(body);
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ErrorResponse> handleGenericException(
            Exception ex, HttpServletRequest request) {

        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(buildError(HttpStatus.INTERNAL_SERVER_ERROR, "An unexpected error occurred", request.getRequestURI(), null));
    }

    // ---------------------------------------------------------------
    private ErrorResponse buildError(HttpStatus status, String message, String path,
                                     List<ErrorResponse.ValidationError> validationErrors) {
        return ErrorResponse.builder()
                .timestamp(OffsetDateTime.now())
                .status(status.value())
                .error(status.getReasonPhrase())
                .message(message)
                .path(path)
                .validationErrors(validationErrors)
                .build();
    }
}
