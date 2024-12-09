package com.expensemanagement.expense_tracker.repository;

import com.expensemanagement.expense_tracker.model.Expense;
import com.expensemanagement.expense_tracker.model.ExpenseStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.List;

public interface ExpenseRepository extends JpaRepository<Expense, Long> {
    List<Expense> findByUserId(Long userId);
    List<Expense> findByDepartmentId(Long departmentId);
    List<Expense> findByStatus(ExpenseStatus status);

    List<Expense> findByDateBetween(LocalDate startDate, LocalDate endDate);
}