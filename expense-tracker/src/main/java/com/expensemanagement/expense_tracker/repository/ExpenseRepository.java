package com.expensemanagement.expense_tracker.repository;

import com.expensemanagement.expense_tracker.model.Expense;
import com.expensemanagement.expense_tracker.model.ExpenseStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.List;

public interface ExpenseRepository extends JpaRepository<Expense, Long> {

    @Query("SELECT e FROM Expense e WHERE CAST(e.date AS LocalDate) BETWEEN :startDate AND :endDate")
    List<Expense> findByDateBetween(@Param("startDate") LocalDate startDate, @Param("endDate") LocalDate endDate);
    List<Expense> findByUserId(Long userId);
    List<Expense> findByDepartmentId(Long departmentId);
    List<Expense> findByStatus(ExpenseStatus status);

    @Query("SELECT COUNT(e) FROM Expense e WHERE e.status = :status")
    long countByStatus(@Param("status") ExpenseStatus status);

    @Query("SELECT COUNT(e) FROM Expense e WHERE e.status = :status AND CAST(e.date AS LocalDate) BETWEEN :startDate AND :endDate")
    long countByStatusAndDateBetween(
            @Param("status") ExpenseStatus status,
            @Param("startDate") LocalDate startDate,
            @Param("endDate") LocalDate endDate
    );

    @Query("SELECT e FROM Expense e WHERE e.status = :status AND CAST(e.date AS LocalDate) BETWEEN :startDate AND :endDate")
    List<Expense> findByStatusAndDateBetween(
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