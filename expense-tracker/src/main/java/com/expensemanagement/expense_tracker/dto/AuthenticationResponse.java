package com.expensemanagement.expense_tracker.dto;

import lombok.Data;

@Data
public class AuthenticationResponse {
    private String token;
    private String username;
    private String role;
}
