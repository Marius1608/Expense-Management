package com.expensemanagement.expense_tracker.controller;

import com.expensemanagement.expense_tracker.model.ExpenseReport;
import com.expensemanagement.expense_tracker.model.User;
import com.expensemanagement.expense_tracker.repository.UserRepository;
import com.expensemanagement.expense_tracker.service.ExpenseReportService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/reports")
@CrossOrigin(origins = "http://localhost:3000")
public class ReportController {
    @Autowired
    private ExpenseReportService reportService;

    @Autowired
    private UserRepository userRepository;

    @PostMapping("/generate")
    public ResponseEntity<?> generateReport(@RequestBody Map<String, String> dateRange, Authentication authentication) {
        try {
            if (dateRange.get("startDate") == null || dateRange.get("endDate") == null) {
                return ResponseEntity.badRequest()
                        .body(new HashMap<String, String>() {{
                            put("error", "Start date and end date are required");
                        }});
            }

            LocalDate startDate = LocalDate.parse(dateRange.get("startDate"));
            LocalDate endDate = LocalDate.parse(dateRange.get("endDate"));

            if (endDate.isBefore(startDate)) {
                return ResponseEntity.badRequest()
                        .body(new HashMap<String, String>() {{
                            put("error", "End date cannot be before start date");
                        }});
            }

            String username = authentication.getName();
            User currentUser = userRepository.findByUsername(username);

            if (currentUser == null) {
                return ResponseEntity.badRequest()
                        .body(new HashMap<String, String>() {{
                            put("error", "User not found");
                        }});
            }

            ExpenseReport report = reportService.generateReport(startDate, endDate, currentUser);

            // Convert report to response format
            Map<String, Object> response = new HashMap<>();
            response.put("totalAmount", report.getTotalAmount());
            response.put("createdAt", report.getCreatedAt());
            response.put("startDate", report.getStartDate());
            response.put("endDate", report.getEndDate());
            response.put("reportStatus", report.getReportStatus());
            response.put("generatedBy", report.getGeneratedBy().getUsername());

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(new HashMap<String, String>() {{
                        put("error", "Failed to generate report: " + e.getMessage());
                    }});
        }
    }
}