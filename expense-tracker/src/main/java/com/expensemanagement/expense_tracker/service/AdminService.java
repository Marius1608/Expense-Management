package com.expensemanagement.expense_tracker.service;

import com.expensemanagement.expense_tracker.model.*;
import com.expensemanagement.expense_tracker.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class AdminService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ExpenseRepository expenseRepository;

    @Autowired
    private DepartmentRepository departmentRepository;

    @Autowired
    private ExpenseCategoryRepository categoryRepository;

    @Autowired
    private AuditLogRepository auditLogRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Transactional
    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    @Transactional
    public User createUser(User user) {
        user.setPassword(passwordEncoder.encode(user.getPassword()));
        User savedUser = userRepository.save(user);
        logAuditEvent(null, "CREATE_USER", "Created user: " + user.getUsername());
        return savedUser;
    }

    @Transactional
    public User updateUser(User user) {
        User existingUser = userRepository.findById(user.getId())
                .orElseThrow(() -> new RuntimeException("User not found"));

        existingUser.setUsername(user.getUsername());
        existingUser.setEmail(user.getEmail());
        existingUser.setRole(user.getRole());
        existingUser.setDepartment(user.getDepartment());

        if (user.getPassword() != null && !user.getPassword().isEmpty()) {
            existingUser.setPassword(passwordEncoder.encode(user.getPassword()));
        }

        logAuditEvent(null, "UPDATE_USER", "Updated user: " + user.getUsername());
        return userRepository.save(existingUser);
    }

    @Transactional
    public void deleteUser(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found"));
        userRepository.delete(user);
        logAuditEvent(null, "DELETE_USER", "Deleted user: " + user.getUsername());
    }

    public Map<String, Object> generateExpenseSummary(LocalDate startDate, LocalDate endDate) {
        List<Expense> expenses = expenseRepository.findByDateBetween(startDate, endDate);

        Map<String, Object> summary = new HashMap<>();
        summary.put("totalExpenses", expenses.stream()
                .map(Expense::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add));
        summary.put("totalCount", expenses.size());
        summary.put("averageAmount", expenses.stream()
                .map(Expense::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add)
                .divide(BigDecimal.valueOf(Math.max(expenses.size(), 1))));

        return summary;
    }

    public List<Map<String, Object>> getExpensesByDepartment(LocalDate startDate, LocalDate endDate) {
        List<Expense> expenses = expenseRepository.findByDateBetween(startDate, endDate);

        return expenses.stream()
                .collect(Collectors.groupingBy(
                        expense -> expense.getDepartment().getName(),
                        Collectors.collectingAndThen(
                                Collectors.toList(),
                                departmentExpenses -> {
                                    Map<String, Object> summary = new HashMap<>();
                                    summary.put("department", departmentExpenses.get(0).getDepartment().getName());
                                    summary.put("totalAmount", departmentExpenses.stream()
                                            .map(Expense::getAmount)
                                            .reduce(BigDecimal.ZERO, BigDecimal::add));
                                    summary.put("count", departmentExpenses.size());
                                    return summary;
                                }
                        )
                ))
                .values()
                .stream()
                .collect(Collectors.toList());
    }

    public List<Map<String, Object>> getExpensesByCategory(LocalDate startDate, LocalDate endDate) {
        List<Expense> expenses = expenseRepository.findByDateBetween(startDate, endDate);

        return expenses.stream()
                .collect(Collectors.groupingBy(
                        expense -> expense.getCategory().getName(),
                        Collectors.collectingAndThen(
                                Collectors.toList(),
                                categoryExpenses -> {
                                    Map<String, Object> summary = new HashMap<>();
                                    summary.put("category", categoryExpenses.get(0).getCategory().getName());
                                    summary.put("totalAmount", categoryExpenses.stream()
                                            .map(Expense::getAmount)
                                            .reduce(BigDecimal.ZERO, BigDecimal::add));
                                    summary.put("count", categoryExpenses.size());
                                    return summary;
                                }
                        )
                ))
                .values()
                .stream()
                .collect(Collectors.toList());
    }

    public List<AuditLog> getAuditLogs(LocalDate startDate, LocalDate endDate) {
        if (startDate == null || endDate == null) {
            return auditLogRepository.findAll();
        }
        return auditLogRepository.findByActionTimestampBetween(
                startDate.atStartOfDay(),
                endDate.plusDays(1).atStartOfDay()
        );
    }

    private void logAuditEvent(User user, String action, String details) {
        AuditLog log = new AuditLog();
        log.setUser(user);
        log.setAction(action);
        log.setActionDetails(details);
        log.setActionTimestamp(LocalDateTime.now());
        auditLogRepository.save(log);
    }

    public List<ExpenseCategory> getAllCategories() {
        return categoryRepository.findAll();
    }

    public ExpenseCategory createCategory(ExpenseCategory category) {
        return categoryRepository.save(category);
    }

    public void deleteCategory(Long id) {
        categoryRepository.deleteById(id);
    }
}