package com.cashtrack.backend.service;

import com.cashtrack.backend.dto.request.CreateCategoryRequest;
import com.cashtrack.backend.dto.request.UpdateCategoryRequest;
import com.cashtrack.backend.dto.response.CategoryResponse;
import com.cashtrack.backend.entity.Category;
import com.cashtrack.backend.exception.CategoryInUseException;
import com.cashtrack.backend.exception.DuplicateResourceException;
import com.cashtrack.backend.exception.ResourceNotFoundException;
import com.cashtrack.backend.mapper.CategoryMapper;
import com.cashtrack.backend.repository.CategoryRepository;
import com.cashtrack.backend.repository.ExpenseRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class CategoryService {

    private final CategoryRepository categoryRepository;
    private final ExpenseRepository expenseRepository;
    private final CategoryMapper categoryMapper;

    @Transactional(readOnly = true)
    public List<CategoryResponse> findAll() {
        log.debug("Fetching all categories");
        return categoryRepository.findAll()
                .stream()
                .map(categoryMapper::toResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public CategoryResponse findById(Long id) {
        log.debug("Fetching category with id: {}", id);
        return categoryRepository.findById(id)
                .map(categoryMapper::toResponse)
                .orElseThrow(() -> new ResourceNotFoundException("Category", id));
    }

    @Transactional
    public CategoryResponse create(CreateCategoryRequest request) {
        log.debug("Creating category with name: {}", request.getName());
        if (categoryRepository.existsByNameIgnoreCase(request.getName())) {
            throw new DuplicateResourceException("Category already exists with name: " + request.getName());
        }
        Category category = categoryMapper.toEntity(request);
        Category saved = categoryRepository.save(category);
        return categoryMapper.toResponse(saved);
    }

    @Transactional
    public CategoryResponse update(Long id, UpdateCategoryRequest request) {
        log.debug("Updating category with id: {}", id);
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Category", id));

        // Only check for duplicate if the name is actually changing
        if (!category.getName().equalsIgnoreCase(request.getName())
                && categoryRepository.existsByNameIgnoreCase(request.getName())) {
            throw new DuplicateResourceException("Category already exists with name: " + request.getName());
        }

        category.setName(request.getName());
        Category saved = categoryRepository.save(category);
        return categoryMapper.toResponse(saved);
    }

    @Transactional
    public void delete(Long id) {
        log.debug("Deleting category with id: {}", id);
        if (!categoryRepository.existsById(id)) {
            throw new ResourceNotFoundException("Category", id);
        }
        if (expenseRepository.existsByCategoryId(id)) {
            throw new CategoryInUseException(
                    "Category with id " + id + " cannot be deleted because it has associated expenses.");
        }
        categoryRepository.deleteById(id);
    }
}
