package com.expensemanagement.expense_tracker.controller;

import com.expensemanagement.expense_tracker.dto.AuthenticationRequest;
import com.expensemanagement.expense_tracker.dto.AuthenticationResponse;
import com.expensemanagement.expense_tracker.dto.RegisterRequest;
import com.expensemanagement.expense_tracker.service.AuthenticationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;

import static javax.swing.UIManager.put;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "http://localhost:3000")
public class AuthenticationController {

    @Autowired
    private AuthenticationService authenticationService;

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody AuthenticationRequest request) {
        try {
            AuthenticationResponse response = authenticationService.authenticate(request);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(new HashMap<String, String>() {{
                        put("message", "Invalid credentials");
                    }});
        }
    }
}