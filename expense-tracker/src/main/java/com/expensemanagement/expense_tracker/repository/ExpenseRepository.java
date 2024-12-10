package com.expensemanagement.expense_tracker.repository;

import com.expensemanagement.expense_tracker.model.Expense;
import com.expensemanagement.expense_tracker.model.ExpenseStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

public interface ExpenseRepository extends JpaRepository<Expense, Long> {
    List<Expense> findByUserId(Long userId);
    List<Expense> findByDepartmentId(Long departmentId);
    List<Expense> findByStatus(ExpenseStatus status);
    List<Expense> findByDateBetween(LocalDate startDate, LocalDate endDate);

    // Add these new methods
    long countByStatus(ExpenseStatus status);

    @Query("SELECT COUNT(e) FROM Expense e WHERE e.status = :status AND e.date BETWEEN :startDate AND :endDate")
    long countByStatusAndDateBetween(
            @Param("status") ExpenseStatus status,
            @Param("startDate") LocalDate startDate,
            @Param("endDate") LocalDate endDate
    );

    @Query("SELECT e FROM Expense e WHERE e.status = :status ORDER BY e.date DESC")
    List<Expense> findByStatusOrderByDateDesc(@Param("status") ExpenseStatus status);

    @Query("SELECT SUM(e.amount) FROM Expense e WHERE e.status = :status AND e.date BETWEEN :startDate AND :endDate")
    Double sumAmountByStatusAndDateBetween(
            @Param("status") ExpenseStatus status,
            @Param("startDate") LocalDate startDate,
            @Param("endDate") LocalDate endDate
    );

    @Query("SELECT e FROM Expense e WHERE e.department.id = :departmentId AND e.status = :status")
    List<Expense> findByDepartmentIdAndStatus(
            @Param("departmentId") Long departmentId,
            @Param("status") ExpenseStatus status
    );
}