package com.cashtrack.backend.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ExpenseSummaryResponse {

    private long totalCount;
    private BigDecimal totalAmount;
}
