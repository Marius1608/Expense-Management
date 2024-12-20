package com.expensemanagement.expense_tracker.controller;

import com.expensemanagement.expense_tracker.model.*;
import com.expensemanagement.expense_tracker.repository.UserRepository;
import com.expensemanagement.expense_tracker.service.AdminService;
import com.expensemanagement.expense_tracker.service.DepartmentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin")
@CrossOrigin(origins = "http://localhost:3000")
public class AdminController {

    @Autowired
    private AdminService adminService;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private DepartmentService departmentService;


    @GetMapping("/users")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<User>> getAllUsers(Authentication authentication) {
        try {
            String username = authentication.getName();
            User admin = userRepository.findByUsername(username);

            if (admin == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
            }

            return ResponseEntity.ok(adminService.getAllUsers());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @PostMapping("/users")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<User> createUser(@RequestBody User user, Authentication authentication) {
        try {
            String username = authentication.getName();
            User admin = userRepository.findByUsername(username);

            if (admin == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
            }

            if (user.getPassword() == null || user.getPassword().trim().isEmpty()) {
                return ResponseEntity.badRequest().build();
            }

            return ResponseEntity.ok(adminService.createUser(user));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @PutMapping("/users/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<User> updateUser(@PathVariable Long id, @RequestBody User user, Authentication authentication) {
        try {
            String username = authentication.getName();
            User admin = userRepository.findByUsername(username);

            if (admin == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
            }

            user.setId(id);
            return ResponseEntity.ok(adminService.updateUser(user));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @DeleteMapping("/users/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteUser(@PathVariable Long id, Authentication authentication) {
        try {
            String username = authentication.getName();
            User admin = userRepository.findByUsername(username);

            if (admin == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
            }

            adminService.deleteUser(id);
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }


    @GetMapping("/departments")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<Department>> getAllDepartments(Authentication authentication) {
        try {
            String username = authentication.getName();
            User admin = userRepository.findByUsername(username);

            if (admin == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
            }

            return ResponseEntity.ok(departmentService.getAllDepartments());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @GetMapping("/categories")
    public ResponseEntity<List<ExpenseCategory>> getAllCategories(Authentication authentication) {
        try {
            String username = authentication.getName();
            User admin = userRepository.findByUsername(username);

            if (admin == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
            }

            return ResponseEntity.ok(adminService.getAllCategories());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @PostMapping("/categories")
    public ResponseEntity<ExpenseCategory> createCategory(@RequestBody ExpenseCategory category, Authentication authentication) {
        try {
            String username = authentication.getName();
            User admin = userRepository.findByUsername(username);

            if (admin == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
            }

            return ResponseEntity.ok(adminService.createCategory(category));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @DeleteMapping("/categories/{id}")
    public ResponseEntity<Void> deleteCategory(@PathVariable Long id, Authentication authentication) {
        try {
            String username = authentication.getName();
            User admin = userRepository.findByUsername(username);

            if (admin == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
            }

            adminService.deleteCategory(id);
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
}