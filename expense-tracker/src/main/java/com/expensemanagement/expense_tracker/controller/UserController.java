package com.expensemanagement.expense_tracker.controller;

import com.expensemanagement.expense_tracker.model.User;
import com.expensemanagement.expense_tracker.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Component;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/users")
@CrossOrigin(origins = "http://localhost:3000")

public class UserController {
    @Autowired
    private UserService userService;

    @PostMapping
    public ResponseEntity<User> createUser(@RequestBody User user) {
        return ResponseEntity.ok(userService.createUser(user));
    }

    @GetMapping("/{id}")
    public ResponseEntity<User> getUser(@PathVariable Long id) {
        User user = userService.getUserById(id);
        return user != null ? ResponseEntity.ok(user) : ResponseEntity.notFound().build();
    }

    @PutMapping("/{id}")
    public ResponseEntity<User> updateUser(@PathVariable Long id, @RequestBody User user) {
        user.setId(id);
        return ResponseEntity.ok(userService.updateUser(user));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteUser(@PathVariable Long id) {
        userService.deleteUser(id);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/current/department")
    @PreAuthorize("hasRole('DEPARTMENT_HEAD')")
    public ResponseEntity<?> getCurrentUserDepartment() {
        User currentUser = userService.getCurrentUser();
        if (currentUser.getDepartment() == null) {
            return ResponseEntity.notFound().build();
        }

        Map<String, Object> departmentInfo = new HashMap<>();
        departmentInfo.put("id", currentUser.getDepartment().getId());
        departmentInfo.put("name", currentUser.getDepartment().getName());

        return ResponseEntity.ok(departmentInfo);
    }

    @GetMapping("/current")
    public ResponseEntity<User> getCurrentUser() {
        User currentUser = userService.getCurrentUser();
        return currentUser != null ? ResponseEntity.ok(currentUser) : ResponseEntity.notFound().build();
    }

}