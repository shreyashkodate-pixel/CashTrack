package com.cashtrack.backend.service;

import com.cashtrack.backend.dto.request.CreateExpenseRequest;
import com.cashtrack.backend.dto.response.ExpenseResponse;
import com.cashtrack.backend.dto.response.ExpenseSummaryResponse;
import com.cashtrack.backend.entity.Category;
import com.cashtrack.backend.entity.Expense;
import com.cashtrack.backend.exception.ResourceNotFoundException;
import com.cashtrack.backend.mapper.ExpenseMapper;
import com.cashtrack.backend.repository.CategoryRepository;
import com.cashtrack.backend.repository.ExpenseRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class ExpenseServiceTest {

    @Mock
    private ExpenseRepository expenseRepository;

    @Mock
    private CategoryRepository categoryRepository;

    @Mock
    private ExpenseMapper expenseMapper;

    @InjectMocks
    private ExpenseService expenseService;

    @Test
    void findById_throwsWhenNotFound() {
        when(expenseRepository.findById(99L)).thenReturn(Optional.empty());
        assertThatThrownBy(() -> expenseService.findById(99L))
                .isInstanceOf(ResourceNotFoundException.class);
    }

    @Test
    void create_throwsWhenCategoryNotFound() {
        CreateExpenseRequest request = new CreateExpenseRequest();
        request.setCategoryId(99L);
        request.setTitle("Coffee");
        request.setAmount(new BigDecimal("150.00"));
        request.setExpenseDate(LocalDate.now());

        when(categoryRepository.findById(99L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> expenseService.create(request))
                .isInstanceOf(ResourceNotFoundException.class);
    }

    @Test
    void create_succeeds() {
        CreateExpenseRequest request = new CreateExpenseRequest();
        request.setCategoryId(1L);
        request.setTitle("Coffee");
        request.setAmount(new BigDecimal("150.00"));
        request.setExpenseDate(LocalDate.now());

        Category category = new Category();
        category.setId(1L);
        category.setName("Food");

        Expense entity = new Expense();
        Expense saved = new Expense();
        saved.setId(10L);
        saved.setCategory(category);

        ExpenseResponse response = ExpenseResponse.builder().id(10L).categoryId(1L).build();

        when(categoryRepository.findById(1L)).thenReturn(Optional.of(category));
        when(expenseMapper.toEntity(request)).thenReturn(entity);
        when(expenseRepository.save(any())).thenReturn(saved);
        when(expenseMapper.toResponse(saved)).thenReturn(response);

        ExpenseResponse result = expenseService.create(request);
        assertThat(result.getId()).isEqualTo(10L);
    }

    @Test
    void delete_throwsWhenNotFound() {
        when(expenseRepository.existsById(99L)).thenReturn(false);
        assertThatThrownBy(() -> expenseService.delete(99L))
                .isInstanceOf(ResourceNotFoundException.class);
    }

    @Test
    void delete_succeeds() {
        when(expenseRepository.existsById(1L)).thenReturn(true);
        expenseService.delete(1L);
        verify(expenseRepository).deleteById(1L);
    }

    @Test
    void getSummary_returnsZeroWhenNoExpenses() {
        when(expenseRepository.countAll()).thenReturn(0L);
        when(expenseRepository.sumAllAmounts()).thenReturn(BigDecimal.ZERO);

        ExpenseSummaryResponse result = expenseService.getSummary(null, null, null);
        assertThat(result.getTotalCount()).isZero();
        assertThat(result.getTotalAmount()).isEqualByComparingTo(BigDecimal.ZERO);
    }
}
