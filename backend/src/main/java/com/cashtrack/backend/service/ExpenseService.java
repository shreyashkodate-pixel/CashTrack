package com.cashtrack.backend.service;

import com.cashtrack.backend.dto.request.CreateExpenseRequest;
import com.cashtrack.backend.dto.request.UpdateExpenseRequest;
import com.cashtrack.backend.dto.response.ExpenseResponse;
import com.cashtrack.backend.dto.response.ExpenseSummaryResponse;
import com.cashtrack.backend.entity.Category;
import com.cashtrack.backend.entity.Expense;
import com.cashtrack.backend.exception.ResourceNotFoundException;
import com.cashtrack.backend.mapper.ExpenseMapper;
import com.cashtrack.backend.repository.CategoryRepository;
import com.cashtrack.backend.repository.ExpenseRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class ExpenseService {

    private final ExpenseRepository expenseRepository;
    private final CategoryRepository categoryRepository;
    private final ExpenseMapper expenseMapper;

    @Transactional(readOnly = true)
    public List<ExpenseResponse> findAll(Long categoryId, LocalDate dateFrom, LocalDate dateTo) {
        log.debug("Fetching expenses — categoryId={}, dateFrom={}, dateTo={}", categoryId, dateFrom, dateTo);

        List<Expense> results;

        if (categoryId != null && dateFrom != null && dateTo != null) {
            results = expenseRepository.findByCategoryIdAndExpenseDateBetween(categoryId, dateFrom, dateTo);
        } else if (categoryId != null) {
            results = expenseRepository.findByCategoryId(categoryId);
        } else if (dateFrom != null && dateTo != null) {
            results = expenseRepository.findByExpenseDateBetween(dateFrom, dateTo);
        } else {
            results = expenseRepository.findAll();
        }

        return results.stream().map(expenseMapper::toResponse).toList();
    }

    @Transactional(readOnly = true)
    public ExpenseResponse findById(Long id) {
        log.debug("Fetching expense with id: {}", id);
        return expenseRepository.findById(id)
                .map(expenseMapper::toResponse)
                .orElseThrow(() -> new ResourceNotFoundException("Expense", id));
    }

    @Transactional
    public ExpenseResponse create(CreateExpenseRequest request) {
        log.debug("Creating expense: title={}, amount={}, categoryId={}",
                request.getTitle(), request.getAmount(), request.getCategoryId());

        Category category = categoryRepository.findById(request.getCategoryId())
                .orElseThrow(() -> new ResourceNotFoundException("Category", request.getCategoryId()));

        Expense expense = expenseMapper.toEntity(request);
        expense.setCategory(category);

        Expense saved = expenseRepository.save(expense);
        return expenseMapper.toResponse(saved);
    }

    @Transactional
    public ExpenseResponse update(Long id, UpdateExpenseRequest request) {
        log.debug("Updating expense with id: {}", id);

        Expense expense = expenseRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Expense", id));

        Category category = categoryRepository.findById(request.getCategoryId())
                .orElseThrow(() -> new ResourceNotFoundException("Category", request.getCategoryId()));

        expense.setTitle(request.getTitle());
        expense.setAmount(request.getAmount());
        expense.setCategory(category);
        expense.setExpenseDate(request.getExpenseDate());
        expense.setDescription(request.getDescription());

        Expense saved = expenseRepository.save(expense);
        return expenseMapper.toResponse(saved);
    }

    @Transactional
    public void delete(Long id) {
        log.debug("Deleting expense with id: {}", id);
        if (!expenseRepository.existsById(id)) {
            throw new ResourceNotFoundException("Expense", id);
        }
        expenseRepository.deleteById(id);
    }

    @Transactional(readOnly = true)
    public ExpenseSummaryResponse getSummary(Long categoryId, LocalDate dateFrom, LocalDate dateTo) {
        log.debug("Getting expense summary — categoryId={}, dateFrom={}, dateTo={}", categoryId, dateFrom, dateTo);

        long count;
        BigDecimal total;

        if (categoryId != null) {
            count = expenseRepository.countByCategoryId(categoryId);
            total = expenseRepository.sumAmountsByCategoryId(categoryId);
        } else if (dateFrom != null && dateTo != null) {
            List<Expense> expenses = expenseRepository.findByExpenseDateBetween(dateFrom, dateTo);
            count = expenses.size();
            total = expenseRepository.sumAmountsByDateRange(dateFrom, dateTo);
        } else {
            count = expenseRepository.countAll();
            total = expenseRepository.sumAllAmounts();
        }

        return ExpenseSummaryResponse.builder()
                .totalCount(count)
                .totalAmount(total != null ? total : BigDecimal.ZERO)
                .build();
    }
}
