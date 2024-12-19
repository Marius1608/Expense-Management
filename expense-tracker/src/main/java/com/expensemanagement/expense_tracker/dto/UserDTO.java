package com.expensemanagement.expense_tracker.dto;

import com.expensemanagement.expense_tracker.model.UserRole;
import lombok.Data;

@Data
public class UserDTO {
    private Long id;
    private String username;
    private String email;
    private UserRole role;
    private String departmentName;
    private Long departmentId;
}
