package com.expensemanagement.expense_tracker.controller;

import com.expensemanagement.expense_tracker.model.ExpenseReport;
import com.expensemanagement.expense_tracker.model.User;
import com.expensemanagement.expense_tracker.service.ExpenseReportService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDate;

@RestController
@RequestMapping("/api/reports")
public class ReportController {
    @Autowired
    private ExpenseReportService reportService;

    @PostMapping("/generate")
    public ResponseEntity<ExpenseReport> generateReport(
            @RequestParam LocalDate startDate,
            @RequestParam LocalDate endDate,
            @AuthenticationPrincipal User user) {
        return ResponseEntity.ok(reportService.generateReport(startDate, endDate, user));
    }
}