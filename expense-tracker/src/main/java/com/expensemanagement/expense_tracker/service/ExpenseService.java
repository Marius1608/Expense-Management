package com.expensemanagement.expense_tracker.service;

import com.expensemanagement.expense_tracker.model.Expense;
import com.expensemanagement.expense_tracker.model.ExpenseStatus;
import com.expensemanagement.expense_tracker.repository.ExpenseRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
public class ExpenseService {
    @Autowired
    private ExpenseRepository expenseRepository;

    public Expense createExpense(Expense expense) {
        return expenseRepository.save(expense);
    }

    public Expense getExpenseById(Long id) {
        return expenseRepository.findById(id).orElse(null);
    }

    public List<Expense> getExpensesByUserId(Long userId) {
        return expenseRepository.findByUserId(userId);
    }

    public List<Expense> getExpensesByDepartment(Long departmentId) {
        return expenseRepository.findByDepartmentId(departmentId);
    }

    public Expense updateExpenseStatus(Long id, ExpenseStatus status) {
        Expense expense = expenseRepository.findById(id).orElse(null);
        if (expense != null) {
            expense.setStatus(status);
            return expenseRepository.save(expense);
        }
        return null;
    }
}