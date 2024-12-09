package com.expensemanagement.expense_tracker.repository;

import com.expensemanagement.expense_tracker.model.Attachment;
import com.expensemanagement.expense_tracker.model.Expense;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AttachmentRepository extends JpaRepository<Attachment, Long> {
    List<Attachment> findByExpense(Expense expense);
}