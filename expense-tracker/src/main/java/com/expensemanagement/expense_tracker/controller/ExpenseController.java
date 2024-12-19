package com.expensemanagement.expense_tracker.controller;

import com.expensemanagement.expense_tracker.dto.ExpenseDTO;
import com.expensemanagement.expense_tracker.model.Expense;
import com.expensemanagement.expense_tracker.model.ExpenseStatus;
import com.expensemanagement.expense_tracker.model.User;
import com.expensemanagement.expense_tracker.repository.UserRepository;
import com.expensemanagement.expense_tracker.service.ExpenseService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/expenses")
@CrossOrigin("http://localhost:3000")
public class ExpenseController {

    @Autowired
    private ExpenseService expenseService;

    @Autowired
    private UserRepository userRepository;

    @GetMapping("/pending")
    public ResponseEntity<List<ExpenseDTO>> getPendingExpenses() {
        List<Expense> expenses = expenseService.getExpensesByStatus(ExpenseStatus.PENDING);
        List<ExpenseDTO> expenseDTOs = expenses.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
        return ResponseEntity.ok(expenseDTOs);
    }


    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'ACCOUNTANT', 'EMPLOYEE', 'DEPARTMENT_HEAD')")
    public ResponseEntity<Expense> createExpense(@RequestBody Expense expense, Authentication authentication) {
        try {

            String username = authentication.getName();
            User currentUser = userRepository.findByUsername(username);

            if (currentUser == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
            }

            expense.setUser(currentUser);
            expense.setDepartment(currentUser.getDepartment());
            expense.setStatus(ExpenseStatus.PENDING);

            if (expense.getDate() == null) {
                expense.setDate(LocalDateTime.now());
            }

            Expense savedExpense = expenseService.createExpense(expense);
            return ResponseEntity.ok(savedExpense);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'ACCOUNTANT', 'EMPLOYEE', 'DEPARTMENT_HEAD')")
    public ResponseEntity<Expense> getExpense(@PathVariable Long id) {
        Expense expense = expenseService.getExpenseById(id);
        return expense != null ? ResponseEntity.ok(expense) : ResponseEntity.notFound().build();
    }

    @GetMapping("/user/{userId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'ACCOUNTANT', 'EMPLOYEE', 'DEPARTMENT_HEAD')")
    public ResponseEntity<List<Expense>> getUserExpenses(@PathVariable Long userId) {
        return ResponseEntity.ok(expenseService.getExpensesByUserId(userId));
    }

    @GetMapping("/department/{departmentId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'ACCOUNTANT', 'EMPLOYEE', 'DEPARTMENT_HEAD')")
    public ResponseEntity<List<Expense>> getDepartmentExpenses(@PathVariable Long departmentId) {
        return ResponseEntity.ok(expenseService.getExpensesByDepartment(departmentId));
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<Expense> updateExpenseStatus(
            @PathVariable Long id,
            @RequestParam ExpenseStatus status) {
        Expense expense = expenseService.updateExpenseStatus(id, status);
        return expense != null ? ResponseEntity.ok(expense) : ResponseEntity.notFound().build();
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'ACCOUNTANT', 'EMPLOYEE', 'DEPARTMENT_HEAD')")
    public ResponseEntity<List<ExpenseDTO>> getAllExpenses() {
        List<Expense> expenses = expenseService.getAllExpenses();
        List<ExpenseDTO> expenseDTOs = expenses.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
        return ResponseEntity.ok(expenseDTOs);
    }

    private ExpenseDTO convertToDTO(Expense expense) {
        ExpenseDTO dto = new ExpenseDTO();
        dto.setId(expense.getId());
        dto.setDescription(expense.getDescription());
        dto.setAmount(expense.getAmount());
        dto.setDate(expense.getDate());
        dto.setStatus(expense.getStatus());
        dto.setCategoryName(expense.getCategory() != null ? expense.getCategory().getName() : null);
        dto.setUserName(expense.getUser() != null ? expense.getUser().getUsername() : null);
        dto.setDepartmentName(expense.getDepartment() != null ? expense.getDepartment().getName() : null);
        return dto;
    }
}