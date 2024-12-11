package com.expensemanagement.expense_tracker.service;

import com.expensemanagement.expense_tracker.model.Expense;
import com.expensemanagement.expense_tracker.model.ExpenseStatus;
import com.expensemanagement.expense_tracker.repository.ExpenseRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class ExpenseService {

    @Autowired
    private ExpenseRepository expenseRepository;

    public Expense createExpense(Expense expense) {
        if (expense.getAmount() == null || expense.getAmount().compareTo(BigDecimal.ZERO) <= 0) {
            throw new IllegalArgumentException("Amount must be greater than 0");
        }
        if (expense.getCategory() == null) {
            throw new IllegalArgumentException("Category is required");
        }
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

    public List<Expense> getExpensesByStatus(ExpenseStatus status) {
        return expenseRepository.findByStatus(status);
    }

    public Map<String, Object> getAccountantStatistics() {
        Map<String, Object> stats = new HashMap<>();
        stats.put("totalPending", expenseRepository.countByStatus(ExpenseStatus.PENDING));
        stats.put("totalApproved", expenseRepository.countByStatusAndDateBetween(
                ExpenseStatus.APPROVED,
                LocalDate.now().withDayOfMonth(1),
                LocalDate.now()
        ));

        return stats;
    }

    public List<Expense> getAllExpenses() {
        return expenseRepository.findAll();
    }
}