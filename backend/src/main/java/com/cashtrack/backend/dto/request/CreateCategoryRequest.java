package com.cashtrack.backend.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class CreateCategoryRequest {

    @NotBlank(message = "Category name must not be blank")
    @Size(max = 100, message = "Category name must be 100 characters or fewer")
    private String name;
}
