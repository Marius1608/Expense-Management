package com.expensemanagement.expense_tracker.dto;

import lombok.Data;

@Data
public class ExpenseCategoryDTO {
    private Long id;
    private String name;
    private String description;
}