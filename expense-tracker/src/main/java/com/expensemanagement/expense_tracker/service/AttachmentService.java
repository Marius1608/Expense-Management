package com.expensemanagement.expense_tracker.service;

import com.expensemanagement.expense_tracker.model.Attachment;
import com.expensemanagement.expense_tracker.model.Expense;
import com.expensemanagement.expense_tracker.repository.AttachmentRepository;
import lombok.Value;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.StandardCopyOption;
import java.time.LocalDateTime;

@Service
public class AttachmentService {

    private String uploadDir;

    @Autowired
    private AttachmentRepository attachmentRepository;

    public Attachment saveAttachment(MultipartFile file, Expense expense) throws IOException {
        String fileName = StringUtils.cleanPath(file.getOriginalFilename());
        String filePath = uploadDir + "/" + fileName;

        Path targetLocation = Path.of(filePath);
        Files.copy(file.getInputStream(), targetLocation, StandardCopyOption.REPLACE_EXISTING);

        Attachment attachment = new Attachment();
        attachment.setFileName(fileName);
        attachment.setFilePath(filePath);
        attachment.setExpense(expense);
        attachment.setUploadedAt(LocalDateTime.now());

        return attachmentRepository.save(attachment);
    }
}