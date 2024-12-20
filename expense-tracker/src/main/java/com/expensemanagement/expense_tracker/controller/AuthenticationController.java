package com.expensemanagement.expense_tracker.controller;

import com.expensemanagement.expense_tracker.dto.AuthenticationRequest;
import com.expensemanagement.expense_tracker.dto.AuthenticationResponse;
import com.expensemanagement.expense_tracker.security.CustomUserDetailsService;
import com.expensemanagement.expense_tracker.security.JwtTokenUtil;
import com.expensemanagement.expense_tracker.service.AuthenticationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "http://localhost:3000")
public class AuthenticationController {

    @Autowired
    private AuthenticationService authenticationService;

    @Autowired
    private JwtTokenUtil jwtTokenUtil;

    @Autowired
    private CustomUserDetailsService userDetailsService;

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

    @PostMapping("/refresh")
    public ResponseEntity<?> refreshToken(@RequestHeader("Authorization") String bearerToken) {
        try {
            String token = bearerToken.substring(7);
            if (!jwtTokenUtil.isRefreshToken(token)) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(new HashMap<String, String>() {{
                            put("message", "Invalid refresh token");
                        }});
            }

            String username = jwtTokenUtil.extractUsername(token);
            UserDetails userDetails = userDetailsService.loadUserByUsername(username);

            if (jwtTokenUtil.validateToken(token, userDetails)) {
                String newToken = jwtTokenUtil.generateToken(userDetails);
                String newRefreshToken = jwtTokenUtil.generateRefreshToken(userDetails);

                return ResponseEntity.ok(new HashMap<String, String>() {{
                    put("token", newToken);
                    put("refreshToken", newRefreshToken);
                }});
            }
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(new HashMap<String, String>() {{
                        put("message", "Token refresh failed");
                    }});
        }

        return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                .body(new HashMap<String, String>() {{
                    put("message", "Invalid token");
                }});
    }
}