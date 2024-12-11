package com.expensemanagement.expense_tracker.dto;

import com.expensemanagement.expense_tracker.model.ExpenseStatus;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public class ExpenseDTO {
    private Long id;
    private String description;
    private BigDecimal amount;
    private LocalDateTime date;
    private ExpenseStatus status;
    private String categoryName;
    private String userName;
    private String departmentName;

    public Long getId() {
        return id;
    }

    public String getDescription() {
        return description;
    }

    public BigDecimal getAmount() {
        return amount;
    }

    public LocalDateTime getDate() {
        return date;
    }

    public ExpenseStatus getStatus() {
        return status;
    }

    public String getCategoryName() {
        return categoryName;
    }

    public String getUserName() {
        return userName;
    }

    public String getDepartmentName() {
        return departmentName;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public void setAmount(BigDecimal amount) {
        this.amount = amount;
    }

    public void setDate(LocalDateTime date) {
        this.date = date;
    }

    public void setStatus(ExpenseStatus status) {
        this.status = status;
    }

    public void setCategoryName(String categoryName) {
        this.categoryName = categoryName;
    }

    public void setUserName(String userName) {
        this.userName = userName;
    }

    public void setDepartmentName(String departmentName) {
        this.departmentName = departmentName;
    }
}
