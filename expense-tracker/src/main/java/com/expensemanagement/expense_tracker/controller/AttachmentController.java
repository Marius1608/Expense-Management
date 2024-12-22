package com.expensemanagement.expense_tracker.controller;

import com.expensemanagement.expense_tracker.model.Attachment;
import com.expensemanagement.expense_tracker.model.Expense;
import com.expensemanagement.expense_tracker.service.AttachmentService;
import com.expensemanagement.expense_tracker.service.ExpenseService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;

@RestController
@RequestMapping("/api/attachments")
public class AttachmentController {
    @Autowired
    private AttachmentService attachmentService;

    @PostMapping("/upload")
    public ResponseEntity<Attachment> uploadAttachment(
            @RequestParam("file") MultipartFile file,
            @RequestParam("expenseId") Long expenseId) throws IOException {
        ExpenseService expenseService = null;
        Expense expense = expenseService.getExpenseById(expenseId);
        return ResponseEntity.ok(attachmentService.saveAttachment(file, expense));
    }
}