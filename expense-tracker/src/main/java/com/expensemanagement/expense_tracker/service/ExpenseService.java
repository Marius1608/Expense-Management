package com.expensemanagement.expense_tracker.service;

import com.expensemanagement.expense_tracker.model.AuditLog;
import com.expensemanagement.expense_tracker.model.Expense;
import com.expensemanagement.expense_tracker.model.ExpenseStatus;
import com.expensemanagement.expense_tracker.model.User;
import com.expensemanagement.expense_tracker.repository.AuditLogRepository;
import com.expensemanagement.expense_tracker.repository.ExpenseRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class ExpenseService {
    @Autowired
    private ExpenseRepository expenseRepository;
    private AuditLogRepository auditLogRepository;
    private UserService userService;


    @Transactional(readOnly = true)
    public List<Expense> getExpensesByDateRange(LocalDate startDate, LocalDate endDate) {
        return expenseRepository.findByDateBetween(startDate, endDate);
    }

    @Transactional(readOnly = true)
    public List<Expense> getExpensesByDepartmentAndDateRange(Long departmentId, LocalDate startDate, LocalDate endDate) {
        return expenseRepository.findByDepartmentIdAndDateBetween(departmentId, startDate, endDate);
    }

    @Autowired
    public ExpenseService(ExpenseRepository expenseRepository,
                          UserService userService,
                          AuditLogRepository auditLogRepository) {
        this.expenseRepository = expenseRepository;
        this.userService = userService;
        this.auditLogRepository = auditLogRepository;
    }

    @Transactional
    public Expense createExpense(Expense expense) {
        validateExpense(expense);
        expense.setStatus(ExpenseStatus.PENDING);
        return expenseRepository.save(expense);
    }

    @Transactional(readOnly = true)
    public Expense getExpenseById(Long id) {
        return expenseRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Expense not found with id: " + id));
    }

    @Transactional(readOnly = true)
    public List<Expense> getAllExpenses() {
        return expenseRepository.findAll();
    }

    @Transactional(readOnly = true)
    public List<Expense> getExpensesByUserId(Long userId) {
        return expenseRepository.findByUserId(userId);
    }

    @Transactional(readOnly = true)
    public List<Expense> getExpensesByDepartment(Long departmentId) {
        return expenseRepository.findByDepartmentId(departmentId);
    }

    @Transactional(readOnly = true)
    public List<Expense> getExpensesByStatus(ExpenseStatus status) {
        return expenseRepository.findByStatus(status);
    }

    @Transactional
    public Expense updateExpenseStatus(Long id, ExpenseStatus status) {
        Expense expense = getExpenseById(id);
        expense.setStatus(status);
        return expenseRepository.save(expense);
    }

    @Transactional(readOnly = true)
    public Map<String, Object> getAccountantStatistics() {
        Map<String, Object> stats = new HashMap<>();

        stats.put("totalPending", expenseRepository.countByStatus(ExpenseStatus.PENDING));

        LocalDate startOfMonth = LocalDate.now().withDayOfMonth(1);
        LocalDate endOfMonth = LocalDate.now();

        stats.put("totalApproved", expenseRepository.countByStatusAndDateBetween(
                ExpenseStatus.APPROVED,
                startOfMonth,
                endOfMonth
        ));

        List<Expense> monthlyExpenses = expenseRepository.findByDateBetween(startOfMonth, endOfMonth);
        BigDecimal monthlyTotal = monthlyExpenses.stream()
                .map(Expense::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        stats.put("monthlyTotal", monthlyTotal);

        return stats;
    }

    @Transactional(readOnly = true)
    public List<Expense> getPendingExpensesByDepartment(Long departmentId) {
        return expenseRepository.findByDepartmentIdAndStatus(departmentId, ExpenseStatus.PENDING);
    }

    private void validateExpense(Expense expense) {
        if (expense.getAmount() == null || expense.getAmount().compareTo(BigDecimal.ZERO) <= 0) {
            throw new IllegalArgumentException("Amount must be greater than 0");
        }
        if (expense.getDescription() == null || expense.getDescription().trim().isEmpty()) {
            throw new IllegalArgumentException("Description is required");
        }
        if (expense.getCategory() == null) {
            throw new IllegalArgumentException("Category is required");
        }
        if (expense.getDate() == null) {
            expense.setDate(LocalDate.now().atStartOfDay());
        }
        if (expense.getDepartment() == null) {
            throw new IllegalArgumentException("Department is required");
        }
        if (expense.getUser() == null) {
            throw new IllegalArgumentException("User is required");
        }
    }

    @Transactional
    public void deleteExpense(Long id) {
        if (!expenseRepository.existsById(id)) {
            throw new RuntimeException("Expense not found with id: " + id);
        }
        expenseRepository.deleteById(id);
    }

    @Transactional
    public Expense updateExpense(Long id, Expense expenseDetails) {
        Expense expense = getExpenseById(id);

        // Only update allowed fields
        if (expenseDetails.getDescription() != null) {
            expense.setDescription(expenseDetails.getDescription());
        }
        if (expenseDetails.getAmount() != null) {
            expense.setAmount(expenseDetails.getAmount());
        }
        if (expenseDetails.getCategory() != null) {
            expense.setCategory(expenseDetails.getCategory());
        }
        if (expenseDetails.getDate() != null) {
            expense.setDate(expenseDetails.getDate());
        }

        validateExpense(expense);
        return expenseRepository.save(expense);
    }

    public Expense updateExpenseStatusWithComment(Long id, ExpenseStatus status, String comment) {
        Expense expense = expenseRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Expense not found"));

        if (expense.getStatus() == ExpenseStatus.APPROVED ||
                expense.getStatus() == ExpenseStatus.REJECTED) {
            throw new RuntimeException("Cannot modify an expense that is already " + expense.getStatus());
        }

        expense.setStatus(status);
        if (comment != null && !comment.trim().isEmpty()) {
            expense.setStatusComment(comment);
        }


        auditLogRepository.save(createAuditLog(expense, status));

        return expenseRepository.save(expense);
    }

    public List<Expense> getExpensesByDepartmentAndStatus(Long departmentId, ExpenseStatus status) {
        return expenseRepository.findByDepartmentIdAndStatus(departmentId, status);
    }

    public List<Expense> getCurrentUserDepartmentPendingExpenses() {
        User currentUser = userService.getCurrentUser();
        if (currentUser.getDepartment() == null) {
            throw new RuntimeException("Current user is not assigned to any department");
        }
        return expenseRepository.findByDepartmentIdAndStatus(
                currentUser.getDepartment().getId(),
                ExpenseStatus.PENDING
        );
    }

    private AuditLog createAuditLog(Expense expense, ExpenseStatus newStatus) {
        AuditLog log = new AuditLog();
        log.setUser(userService.getCurrentUser());
        log.setAction("EXPENSE_STATUS_UPDATE");
        log.setActionDetails("Updated expense ID " + expense.getId() + " status to " + newStatus);
        log.setActionTimestamp(LocalDateTime.now());
        return log;
    }

    public Map<String, Object> getDepartmentSummary(Long departmentId) {
        Map<String, Object> summary = new HashMap<>();
        
        // Calculate total expenses
        BigDecimal totalExpenses = expenseRepository.findByDepartmentId(departmentId).stream()
                .map(Expense::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        summary.put("totalExpenses", totalExpenses);
        
        // Calculate pending, approved, and rejected expense counts
        long pendingCount = expenseRepository.countByDepartmentIdAndStatus(departmentId, ExpenseStatus.PENDING);
        long approvedCount = expenseRepository.countByDepartmentIdAndStatus(departmentId, ExpenseStatus.APPROVED);
        long rejectedCount = expenseRepository.countByDepartmentIdAndStatus(departmentId, ExpenseStatus.REJECTED);
        
        summary.put("pendingCount", pendingCount);
        summary.put("approvedCount", approvedCount);
        summary.put("rejectedCount", rejectedCount);
        
        return summary;
        
    }



}