package com.cashtrack.backend.repository;

import com.cashtrack.backend.entity.Expense;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@Repository
public interface ExpenseRepository extends JpaRepository<Expense, Long> {

    List<Expense> findByCategoryId(Long categoryId);

    List<Expense> findByExpenseDateBetween(LocalDate from, LocalDate to);

    List<Expense> findByCategoryIdAndExpenseDateBetween(Long categoryId, LocalDate from, LocalDate to);

    @Query("SELECT COUNT(e) FROM Expense e")
    long countAll();

    @Query("SELECT COALESCE(SUM(e.amount), 0) FROM Expense e")
    BigDecimal sumAllAmounts();

    @Query("SELECT COALESCE(SUM(e.amount), 0) FROM Expense e WHERE e.category.id = :categoryId")
    BigDecimal sumAmountsByCategoryId(@Param("categoryId") Long categoryId);

    @Query("SELECT COALESCE(SUM(e.amount), 0) FROM Expense e WHERE e.expenseDate BETWEEN :from AND :to")
    BigDecimal sumAmountsByDateRange(@Param("from") LocalDate from, @Param("to") LocalDate to);

    @Query("SELECT COUNT(e) FROM Expense e WHERE e.category.id = :categoryId")
    long countByCategoryId(@Param("categoryId") Long categoryId);

    boolean existsByCategoryId(Long categoryId);
}
