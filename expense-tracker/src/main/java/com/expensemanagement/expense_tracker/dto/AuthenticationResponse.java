package com.expensemanagement.expense_tracker.dto;

import com.expensemanagement.expense_tracker.model.Department;
import lombok.Data;

@Data
public class AuthenticationResponse {
    private String token;
    private String username;
    private String role;
    private Department department;

    public void setDepartment(Department department) {
        this.department = department;
    }
}
