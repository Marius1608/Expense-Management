package com.expensemanagement.expense_tracker.repository;

import com.expensemanagement.expense_tracker.model.ExpenseCategory;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ExpenseCategoryRepository extends JpaRepository<ExpenseCategory, Long> {
    ExpenseCategory findByName(String name);
}