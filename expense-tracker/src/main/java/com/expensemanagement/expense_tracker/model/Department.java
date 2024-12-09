package com.expensemanagement.expense_tracker.model;

import jakarta.persistence.*;
import lombok.Data;
import java.util.List;

@Data
@Entity
@Table(name = "departments")
public class Department {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;
    private Double budget;

    @OneToMany(mappedBy = "department")
    private List<User> users;

    @OneToMany(mappedBy = "department")
    private List<Expense> expenses;
}