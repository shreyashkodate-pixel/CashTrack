package com.cashtrack.backend.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.OffsetDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CategoryResponse {

    private Long id;
    private String name;
    private OffsetDateTime createdAt;
    private OffsetDateTime updatedAt;
}
