package com.cashtrack.backend.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.OffsetDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ExpenseResponse {

    private Long id;
    private String title;
    private BigDecimal amount;
    private Long categoryId;
    private String categoryName;
    private LocalDate expenseDate;
    private String description;
    private OffsetDateTime createdAt;
    private OffsetDateTime updatedAt;
}
