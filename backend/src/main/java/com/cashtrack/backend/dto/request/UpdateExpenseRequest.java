package com.cashtrack.backend.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
public class UpdateExpenseRequest {

    @NotBlank(message = "Title must not be blank")
    @Size(max = 120, message = "Title must be 120 characters or fewer")
    private String title;

    @NotNull(message = "Amount is required")
    @Positive(message = "Amount must be greater than 0")
    private BigDecimal amount;

    @NotNull(message = "Category ID is required")
    private Long categoryId;

    @NotNull(message = "Expense date is required")
    private LocalDate expenseDate;

    private String description;
}
