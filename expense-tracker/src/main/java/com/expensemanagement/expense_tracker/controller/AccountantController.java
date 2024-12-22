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

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

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

    @PutMapping("/expenses/{id}/status")
    @PreAuthorize("hasAnyRole('ACCOUNTANT', 'DEPARTMENT_HEAD')")
    public ResponseEntity<Expense> updateExpenseStatus(
            @PathVariable Long id,
            @RequestParam ExpenseStatus status,
            @RequestParam(required = false) String comment) {
        return ResponseEntity.ok(expenseService.updateExpenseStatusWithComment(id, status, comment));
    }

    @GetMapping("/expenses/department/{departmentId}/pending")
    @PreAuthorize("hasRole('DEPARTMENT_HEAD')")
    public ResponseEntity<List<Expense>> getDepartmentPendingExpenses(@PathVariable Long departmentId) {
        return ResponseEntity.ok(expenseService.getExpensesByDepartmentAndStatus(departmentId, ExpenseStatus.PENDING));
    }

    @GetMapping("/expenses/my-department/pending")
    @PreAuthorize("hasRole('DEPARTMENT_HEAD')")
    public ResponseEntity<List<Expense>> getMyDepartmentPendingExpenses() {
        return ResponseEntity.ok(expenseService.getCurrentUserDepartmentPendingExpenses());
    }

    @PostMapping("/reports")
    @PreAuthorize("hasRole('ACCOUNTANT')")
    public ResponseEntity<Map<String, Object>> generateReport(@RequestBody Map<String, String> reportParams) {
        try {
            LocalDate startDate = LocalDate.parse(reportParams.get("startDate"));
            LocalDate endDate = LocalDate.parse(reportParams.get("endDate"));
            String reportType = reportParams.getOrDefault("reportType", "all");

            Map<String, Object> reportData = new HashMap<>();
            List<Expense> expenses = expenseService.getExpensesByDateRange(startDate, endDate);

            // Calculate totals
            BigDecimal totalAmount = expenses.stream()
                    .map(Expense::getAmount)
                    .reduce(BigDecimal.ZERO, BigDecimal::add);

            reportData.put("totalAmount", totalAmount);
            reportData.put("transactionCount", expenses.size());
            reportData.put("averageAmount", expenses.isEmpty() ? 0 :
                    totalAmount.divide(BigDecimal.valueOf(expenses.size()), 2, RoundingMode.HALF_UP));

            List<Map<String, Object>> chartData = new ArrayList<>();

            switch (reportType) {
                case "byCategory":
                    Map<String, BigDecimal> categoryTotals = new HashMap<>();
                    for (Expense expense : expenses) {
                        String categoryName = expense.getCategory() != null ?
                                expense.getCategory().getName() : "Uncategorized";
                        categoryTotals.merge(categoryName, expense.getAmount(), BigDecimal::add);
                    }

                    chartData = categoryTotals.entrySet().stream()
                            .map(entry -> {
                                Map<String, Object> data = new HashMap<>();
                                data.put("name", entry.getKey());
                                data.put("amount", entry.getValue());
                                return data;
                            })
                            .collect(Collectors.toList());
                    break;

                case "byDepartment":
                    Map<String, BigDecimal> departmentTotals = new HashMap<>();
                    for (Expense expense : expenses) {
                        String deptName = expense.getDepartment() != null ?
                                expense.getDepartment().getName() : "No Department";
                        departmentTotals.merge(deptName, expense.getAmount(), BigDecimal::add);
                    }

                    chartData = departmentTotals.entrySet().stream()
                            .map(entry -> {
                                Map<String, Object> data = new HashMap<>();
                                data.put("name", entry.getKey());
                                data.put("amount", entry.getValue());
                                return data;
                            })
                            .collect(Collectors.toList());
                    break;

                case "byStatus":
                    Map<ExpenseStatus, BigDecimal> statusTotals = new HashMap<>();
                    for (Expense expense : expenses) {
                        statusTotals.merge(expense.getStatus(), expense.getAmount(), BigDecimal::add);
                    }

                    chartData = statusTotals.entrySet().stream()
                            .map(entry -> {
                                Map<String, Object> data = new HashMap<>();
                                data.put("name", entry.getKey().toString());
                                data.put("amount", entry.getValue());
                                return data;
                            })
                            .collect(Collectors.toList());
                    break;

                default:
                    Map<String, BigDecimal> monthlyTotals = new HashMap<>();
                    for (Expense expense : expenses) {
                        String monthYear = expense.getDate().format(DateTimeFormatter.ofPattern("MMM yyyy"));
                        monthlyTotals.merge(monthYear, expense.getAmount(), BigDecimal::add);
                    }

                    chartData = monthlyTotals.entrySet().stream()
                            .map(entry -> {
                                Map<String, Object> data = new HashMap<>();
                                data.put("name", entry.getKey());
                                data.put("amount", entry.getValue());
                                return data;
                            })
                            .collect(Collectors.toList());
                    break;
            }

            reportData.put("chartData", chartData);
            return ResponseEntity.ok(reportData);
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(Collections.singletonMap("error", e.getMessage()));
        }
    }
}