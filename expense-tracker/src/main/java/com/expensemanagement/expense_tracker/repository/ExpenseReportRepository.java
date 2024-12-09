package com.expensemanagement.expense_tracker.repository;

import com.expensemanagement.expense_tracker.model.ExpenseReport;
import com.expensemanagement.expense_tracker.model.ReportStatus;
import com.expensemanagement.expense_tracker.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ExpenseReportRepository extends JpaRepository<ExpenseReport, Long> {
    List<ExpenseReport> findByGeneratedBy(User user);
    List<ExpenseReport> findByReportStatus(ReportStatus status);
}