package com.expensemanagement.expense_tracker.controller;


import com.expensemanagement.expense_tracker.model.ExpenseCategory;
import com.expensemanagement.expense_tracker.service.ExpenseCategoryService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/categories")
public class ExpenseCategoryController {
    @Autowired
    private ExpenseCategoryService categoryService;

    @PostMapping
    public ResponseEntity<ExpenseCategory> createCategory(@RequestBody ExpenseCategory category) {
        return ResponseEntity.ok(categoryService.createCategory(category));
    }

    @GetMapping
    public ResponseEntity<List<ExpenseCategory>> getAllCategories() {
        return ResponseEntity.ok(categoryService.getAllCategories());
    }
}