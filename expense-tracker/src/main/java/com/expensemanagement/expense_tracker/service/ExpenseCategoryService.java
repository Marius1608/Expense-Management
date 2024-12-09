package com.expensemanagement.expense_tracker.service;

import com.expensemanagement.expense_tracker.model.ExpenseCategory;
import com.expensemanagement.expense_tracker.repository.ExpenseCategoryRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ExpenseCategoryService {
    @Autowired
    private ExpenseCategoryRepository categoryRepository;

    public ExpenseCategory createCategory(ExpenseCategory category) {
        return categoryRepository.save(category);
    }

    public List<ExpenseCategory> getAllCategories() {
        return categoryRepository.findAll();
    }
}
