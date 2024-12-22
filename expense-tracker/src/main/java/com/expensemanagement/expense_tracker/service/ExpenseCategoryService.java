package com.expensemanagement.expense_tracker.service;

import com.expensemanagement.expense_tracker.model.ExpenseCategory;
import com.expensemanagement.expense_tracker.repository.ExpenseCategoryRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class ExpenseCategoryService {
    @Autowired
    private ExpenseCategoryRepository categoryRepository;

    @Transactional(readOnly = true)
    public List<ExpenseCategory> getAllCategories() {
        return categoryRepository.findAll();
    }

    @Transactional
    public ExpenseCategory createCategory(ExpenseCategory category) {
        if (category.getName() == null || category.getName().trim().isEmpty()) {
            throw new IllegalArgumentException("Category name cannot be empty");
        }
        return categoryRepository.save(category);
    }

    @Transactional
    public void deleteCategory(Long id) {
        if (!categoryRepository.existsById(id)) {
            throw new IllegalArgumentException("Category not found with id: " + id);
        }
        categoryRepository.deleteById(id);
    }

    @Transactional(readOnly = true)
    public ExpenseCategory getCategoryById(Long id) {
        return categoryRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Category not found with id: " + id));
    }
}