package com.expensemanagement.expense_tracker.service;

import com.expensemanagement.expense_tracker.model.Expense;
import com.expensemanagement.expense_tracker.model.ExpenseReport;
import com.expensemanagement.expense_tracker.model.ReportStatus;
import com.expensemanagement.expense_tracker.model.User;
import com.expensemanagement.expense_tracker.repository.ExpenseReportRepository;
import com.expensemanagement.expense_tracker.repository.ExpenseRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Service
public class ExpenseReportService {
    @Autowired
    private ExpenseReportRepository reportRepository;

    @Autowired
    private ExpenseRepository expenseRepository;

    public ExpenseReport generateReport(LocalDate startDate, LocalDate endDate, User user) {
        List<Expense> expenses = expenseRepository.findByDateBetween(startDate, endDate);
        BigDecimal totalAmount = expenses.stream()
                .map(Expense::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        ExpenseReport report = new ExpenseReport();
        report.setReportName("Expense Report " + startDate + " to " + endDate);
        report.setStartDate(startDate);
        report.setEndDate(endDate);
        report.setTotalAmount(totalAmount);
        report.setGeneratedBy(user);
        report.setCreatedAt(LocalDateTime.now());
        report.setReportStatus(ReportStatus.COMPLETED);

        return reportRepository.save(report);
    }
}
