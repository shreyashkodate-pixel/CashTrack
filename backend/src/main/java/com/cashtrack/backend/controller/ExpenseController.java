package com.cashtrack.backend.controller;

import com.cashtrack.backend.dto.request.CreateExpenseRequest;
import com.cashtrack.backend.dto.request.UpdateExpenseRequest;
import com.cashtrack.backend.dto.response.ExpenseResponse;
import com.cashtrack.backend.dto.response.ExpenseSummaryResponse;
import com.cashtrack.backend.service.ExpenseService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/v1/expenses")
@RequiredArgsConstructor
@Tag(name = "Expenses", description = "Manage expenses")
public class ExpenseController {

    private final ExpenseService expenseService;

    @GetMapping
    @Operation(summary = "List expenses, optionally filtered by category or date range")
    public ResponseEntity<List<ExpenseResponse>> getAll(
            @RequestParam(required = false) Long categoryId,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate dateFrom,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate dateTo) {
        return ResponseEntity.ok(expenseService.findAll(categoryId, dateFrom, dateTo));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get an expense by ID")
    public ResponseEntity<ExpenseResponse> getById(@PathVariable Long id) {
        return ResponseEntity.ok(expenseService.findById(id));
    }

    @PostMapping
    @Operation(summary = "Create a new expense")
    public ResponseEntity<ExpenseResponse> create(@Valid @RequestBody CreateExpenseRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(expenseService.create(request));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update an existing expense")
    public ResponseEntity<ExpenseResponse> update(
            @PathVariable Long id,
            @Valid @RequestBody UpdateExpenseRequest request) {
        return ResponseEntity.ok(expenseService.update(id, request));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete an expense")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        expenseService.delete(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/summary")
    @Operation(summary = "Get expense summary — total count and amount, with optional filters")
    public ResponseEntity<ExpenseSummaryResponse> getSummary(
            @RequestParam(required = false) Long categoryId,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate dateFrom,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate dateTo) {
        return ResponseEntity.ok(expenseService.getSummary(categoryId, dateFrom, dateTo));
    }
}
