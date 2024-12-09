package com.expensemanagement.expense_tracker.model;

import jakarta.persistence.*;
import lombok.Data;

@Data
@Entity
@Table(name = "expense_categories")
public class ExpenseCategory {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;
    private String description;
}