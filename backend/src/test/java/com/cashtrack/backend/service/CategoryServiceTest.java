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
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class CategoryServiceTest {

    @Mock
    private CategoryRepository categoryRepository;

    @Mock
    private ExpenseRepository expenseRepository;

    @Mock
    private CategoryMapper categoryMapper;

    @InjectMocks
    private CategoryService categoryService;

    @Test
    void findAll_returnsMappedList() {
        Category cat = new Category();
        cat.setId(1L);
        cat.setName("Food");
        CategoryResponse response = CategoryResponse.builder().id(1L).name("Food").build();

        when(categoryRepository.findAll()).thenReturn(List.of(cat));
        when(categoryMapper.toResponse(cat)).thenReturn(response);

        List<CategoryResponse> result = categoryService.findAll();

        assertThat(result).hasSize(1);
        assertThat(result.get(0).getName()).isEqualTo("Food");
    }

    @Test
    void findById_throwsWhenNotFound() {
        when(categoryRepository.findById(99L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> categoryService.findById(99L))
                .isInstanceOf(ResourceNotFoundException.class);
    }

    @Test
    void create_throwsOnDuplicateName() {
        CreateCategoryRequest request = new CreateCategoryRequest();
        request.setName("Food");

        when(categoryRepository.existsByNameIgnoreCase("Food")).thenReturn(true);

        assertThatThrownBy(() -> categoryService.create(request))
                .isInstanceOf(DuplicateResourceException.class);
    }

    @Test
    void create_succeeds() {
        CreateCategoryRequest request = new CreateCategoryRequest();
        request.setName("Transport");

        Category entity = new Category();
        entity.setName("Transport");
        Category saved = new Category();
        saved.setId(2L);
        saved.setName("Transport");
        CategoryResponse response = CategoryResponse.builder().id(2L).name("Transport").build();

        when(categoryRepository.existsByNameIgnoreCase("Transport")).thenReturn(false);
        when(categoryMapper.toEntity(request)).thenReturn(entity);
        when(categoryRepository.save(entity)).thenReturn(saved);
        when(categoryMapper.toResponse(saved)).thenReturn(response);

        CategoryResponse result = categoryService.create(request);
        assertThat(result.getName()).isEqualTo("Transport");
    }

    @Test
    void delete_throwsWhenCategoryInUse() {
        when(categoryRepository.existsById(1L)).thenReturn(true);
        when(expenseRepository.existsByCategoryId(1L)).thenReturn(true);

        assertThatThrownBy(() -> categoryService.delete(1L))
                .isInstanceOf(CategoryInUseException.class);
    }

    @Test
    void delete_succeeds() {
        when(categoryRepository.existsById(1L)).thenReturn(true);
        when(expenseRepository.existsByCategoryId(1L)).thenReturn(false);

        categoryService.delete(1L);

        verify(categoryRepository).deleteById(1L);
    }
}
