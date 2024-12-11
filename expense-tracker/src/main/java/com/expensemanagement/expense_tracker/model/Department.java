package com.expensemanagement.expense_tracker.model;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.Data;
import lombok.ToString;

import java.util.List;

@JsonIgnoreProperties({"expenses"})
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
    @ToString.Exclude
    private List<User> users;

    @OneToMany(mappedBy = "department")
    @ToString.Exclude
    private List<Expense> expenses;
}