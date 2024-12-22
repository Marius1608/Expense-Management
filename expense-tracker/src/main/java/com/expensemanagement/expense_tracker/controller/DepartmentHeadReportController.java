package com.expensemanagement.expense_tracker.controller;

import com.expensemanagement.expense_tracker.model.*;
import com.expensemanagement.expense_tracker.service.ExpenseReportService;
import com.expensemanagement.expense_tracker.service.ExpenseService;
import com.expensemanagement.expense_tracker.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/reports/department")
@CrossOrigin(origins = "http://localhost:3000")
public class DepartmentHeadReportController {

    @Autowired
    private ExpenseReportService reportService;

    @Autowired
    private ExpenseService expenseService;

    @Autowired
    private UserService userService;

    @PostMapping("/{departmentId}")
    @PreAuthorize("hasRole('DEPARTMENT_HEAD')")
    public ResponseEntity<?> generateDepartmentReport(
            @PathVariable Long departmentId,
            @RequestBody Map<String, Object> requestBody) {
        try {
            // Validate department head's access
            User currentUser = userService.getCurrentUser();
            if (!currentUser.getDepartment().getId().equals(departmentId)) {
                return ResponseEntity.badRequest()
                        .body(new HashMap<String, String>() {{
                            put("error", "Unauthorized to access this department's reports");
                        }});
            }

            LocalDate startDate = LocalDate.parse((String) requestBody.get("startDate"));
            LocalDate endDate = LocalDate.parse((String) requestBody.get("endDate"));
            String reportType = (String) requestBody.get("reportType");

            List<Expense> departmentExpenses = expenseService.getExpensesByDepartmentAndDateRange(
                    departmentId, startDate, endDate);

            System.out.println("Found " + departmentExpenses.size() + " expenses");
            departmentExpenses.forEach(expense -> {
                System.out.println("Expense ID: " + expense.getId() +
                        ", Amount: " + expense.getAmount() +
                        ", Date: " + expense.getDate());
            });


            Map<String, Object> report = new HashMap<>();

            BigDecimal totalAmount = calculateTotalAmount(departmentExpenses);
            System.out.println("Calculated total amount: " + totalAmount);

            report.put("totalAmount", totalAmount);
            report.put("totalCount", departmentExpenses.size());
            report.put("averageAmount", calculateAverageAmount(departmentExpenses));

            List<Map<String, Object>> monthlyData = generateMonthlyData(departmentExpenses);
            System.out.println("Generated monthly data: " + monthlyData);
            report.put("monthlyData", monthlyData);

            List<Map<String, Object>> categoryData = generateCategoryData(departmentExpenses);
            System.out.println("Generated category data: " + categoryData);
            report.put("categoryData", categoryData);

            System.out.println("Final Generated Report: " + report);

            return ResponseEntity.ok(report);

        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.badRequest()
                    .body(new HashMap<String, String>() {{
                        put("error", "Failed to generate report: " + e.getMessage());
                    }});
        }
    }

    private BigDecimal calculateTotalAmount(List<Expense> expenses) {
        return expenses.stream()
                .map(Expense::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
    }

    private BigDecimal calculateAverageAmount(List<Expense> expenses) {
        if (expenses.isEmpty()) return BigDecimal.ZERO;
        BigDecimal total = calculateTotalAmount(expenses);
        return total.divide(new BigDecimal(expenses.size()), 2, RoundingMode.HALF_UP);
    }

    private List<Map<String, Object>> generateMonthlyData(List<Expense> expenses) {
        if (expenses.isEmpty()) {
            return new ArrayList<>();
        }

        Map<String, BigDecimal> monthlyTotals = expenses.stream()
                .collect(Collectors.groupingBy(
                        expense -> expense.getDate().format(DateTimeFormatter.ofPattern("yyyy-MM")),
                        Collectors.reducing(
                                BigDecimal.ZERO,
                                Expense::getAmount,
                                BigDecimal::add
                        )
                ));

        return monthlyTotals.entrySet().stream()
                .sorted(Map.Entry.comparingByKey())
                .map(entry -> {
                    Map<String, Object> monthData = new HashMap<>();
                    monthData.put("month", entry.getKey());
                    monthData.put("amount", entry.getValue());
                    return monthData;
                })
                .collect(Collectors.toList());
    }

    private List<Map<String, Object>> generateCategoryData(List<Expense> expenses) {
        if (expenses.isEmpty()) {
            return new ArrayList<>();
        }

        Map<String, BigDecimal> categoryTotals = expenses.stream()
                .filter(expense -> expense.getCategory() != null)
                .collect(Collectors.groupingBy(
                        expense -> expense.getCategory().getName(),
                        Collectors.reducing(
                                BigDecimal.ZERO,
                                Expense::getAmount,
                                BigDecimal::add
                        )
                ));

        return categoryTotals.entrySet().stream()
                .map(entry -> {
                    Map<String, Object> categoryData = new HashMap<>();
                    categoryData.put("category", entry.getKey());
                    categoryData.put("amount", entry.getValue());
                    return categoryData;
                })
                .collect(Collectors.toList());
    }
}