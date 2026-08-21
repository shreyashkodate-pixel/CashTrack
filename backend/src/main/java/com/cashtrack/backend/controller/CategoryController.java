package com.cashtrack.backend.controller;

import com.cashtrack.backend.dto.request.CreateCategoryRequest;
import com.cashtrack.backend.dto.request.UpdateCategoryRequest;
import com.cashtrack.backend.dto.response.CategoryResponse;
import com.cashtrack.backend.service.CategoryService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/categories")
@RequiredArgsConstructor
@Tag(name = "Categories", description = "Manage expense categories")
public class CategoryController {

    private final CategoryService categoryService;

    @GetMapping
    @Operation(summary = "Get all categories")
    public ResponseEntity<List<CategoryResponse>> getAll() {
        return ResponseEntity.ok(categoryService.findAll());
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get a category by ID")
    public ResponseEntity<CategoryResponse> getById(@PathVariable Long id) {
        return ResponseEntity.ok(categoryService.findById(id));
    }

    @PostMapping
    @Operation(summary = "Create a new category")
    public ResponseEntity<CategoryResponse> create(@Valid @RequestBody CreateCategoryRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(categoryService.create(request));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update an existing category")
    public ResponseEntity<CategoryResponse> update(
            @PathVariable Long id,
            @Valid @RequestBody UpdateCategoryRequest request) {
        return ResponseEntity.ok(categoryService.update(id, request));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete a category (only if no expenses are associated)")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        categoryService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
