package com.expensemanagement.expense_tracker.controller;

import com.expensemanagement.expense_tracker.model.Expense;
import com.expensemanagement.expense_tracker.model.ExpenseReport;
import com.expensemanagement.expense_tracker.model.ExpenseStatus;
import com.expensemanagement.expense_tracker.service.ExpenseReportService;
import com.expensemanagement.expense_tracker.service.ExpenseService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/accountant")
public class AccountantController {
    @Autowired
    private ExpenseService expenseService;

    @Autowired
    private ExpenseReportService reportService;

    @GetMapping("/expenses/pending")
    @PreAuthorize("hasRole('ACCOUNTANT')")
    public ResponseEntity<List<Expense>> getPendingExpenses() {
        return ResponseEntity.ok(expenseService.getExpensesByStatus(ExpenseStatus.PENDING));
    }

    @PutMapping("/expenses/{id}/approve")
    @PreAuthorize("hasRole('ACCOUNTANT')")
    public ResponseEntity<Expense> approveExpense(@PathVariable Long id) {
        return ResponseEntity.ok(expenseService.updateExpenseStatus(id, ExpenseStatus.APPROVED));
    }



    @GetMapping("/statistics")
    @PreAuthorize("hasRole('ACCOUNTANT')")
    public ResponseEntity<Map<String, Object>> getAccountantStatistics() {
        return ResponseEntity.ok(expenseService.getAccountantStatistics());
    }

}