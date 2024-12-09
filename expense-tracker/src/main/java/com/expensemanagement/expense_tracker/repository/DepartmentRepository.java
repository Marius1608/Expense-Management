package com.expensemanagement.expense_tracker.repository;

import com.expensemanagement.expense_tracker.model.Department;
import org.springframework.data.jpa.repository.JpaRepository;

public interface DepartmentRepository extends JpaRepository<Department, Long> {
    Department findByName(String name);
}