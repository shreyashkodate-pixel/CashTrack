package com.cashtrack.backend.controller;

import com.cashtrack.backend.dto.request.CreateCategoryRequest;
import com.cashtrack.backend.dto.request.CreateExpenseRequest;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.testcontainers.service.connection.ServiceConnection;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.testcontainers.containers.PostgreSQLContainer;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;

import java.math.BigDecimal;
import java.time.LocalDate;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@Testcontainers
@ActiveProfiles("test")
class ExpenseControllerTest {

    @Container
    @ServiceConnection
    static PostgreSQLContainer<?> postgres = new PostgreSQLContainer<>("postgres:16");

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    private Long testCategoryId;

    @BeforeEach
    void setupCategory() throws Exception {
        // Create a category to use in expense tests
        CreateCategoryRequest categoryRequest = new CreateCategoryRequest();
        categoryRequest.setName("TestCategory_" + System.currentTimeMillis());

        String response = mockMvc.perform(post("/api/v1/categories")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(categoryRequest)))
                .andReturn().getResponse().getContentAsString();

        testCategoryId = objectMapper.readTree(response).get("id").asLong();
    }

    @Test
    void createAndFetchExpense() throws Exception {
        CreateExpenseRequest request = new CreateExpenseRequest();
        request.setTitle("Test Expense");
        request.setAmount(new BigDecimal("100.50"));
        request.setCategoryId(testCategoryId);
        request.setExpenseDate(LocalDate.now());

        // Create
        String response = mockMvc.perform(post("/api/v1/expenses")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.title").value("Test Expense"))
                .andExpect(jsonPath("$.amount").value(100.5))
                .andReturn().getResponse().getContentAsString();

        Long id = objectMapper.readTree(response).get("id").asLong();

        // Get by ID
        mockMvc.perform(get("/api/v1/expenses/" + id))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.title").value("Test Expense"));
    }

    @Test
    void createExpenseWithInvalidData_returns400() throws Exception {
        CreateExpenseRequest request = new CreateExpenseRequest();
        request.setTitle(""); // Invalid
        request.setAmount(new BigDecimal("-10")); // Invalid

        mockMvc.perform(post("/api/v1/expenses")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.validationErrors").isArray());
    }

    @Test
    void getExpenseSummary() throws Exception {
        mockMvc.perform(get("/api/v1/expenses/summary"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.totalCount").isNumber())
                .andExpect(jsonPath("$.totalAmount").isNumber());
    }
}
