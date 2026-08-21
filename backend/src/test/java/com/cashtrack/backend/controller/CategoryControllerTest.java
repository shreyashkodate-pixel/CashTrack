package com.cashtrack.backend.controller;

import com.cashtrack.backend.dto.request.CreateCategoryRequest;
import com.cashtrack.backend.dto.request.UpdateCategoryRequest;
import com.fasterxml.jackson.databind.ObjectMapper;
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

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@Testcontainers
@ActiveProfiles("test")
class CategoryControllerTest {

    @Container
    @ServiceConnection
    static PostgreSQLContainer<?> postgres = new PostgreSQLContainer<>("postgres:16");

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Test
    void createAndFetchCategory() throws Exception {
        CreateCategoryRequest request = new CreateCategoryRequest();
        request.setName("Food");

        // Create
        mockMvc.perform(post("/api/v1/categories")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.name").value("Food"))
                .andExpect(jsonPath("$.id").isNumber());

        // List
        mockMvc.perform(get("/api/v1/categories"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].name").value("Food"));
    }

    @Test
    void createDuplicateCategory_returns409() throws Exception {
        CreateCategoryRequest request = new CreateCategoryRequest();
        request.setName("Transport");

        mockMvc.perform(post("/api/v1/categories")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated());

        // Duplicate
        mockMvc.perform(post("/api/v1/categories")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isConflict());
    }

    @Test
    void createCategoryWithBlankName_returns400() throws Exception {
        CreateCategoryRequest request = new CreateCategoryRequest();
        request.setName("");

        mockMvc.perform(post("/api/v1/categories")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.validationErrors").isArray());
    }

    @Test
    void deleteCategory_returns204() throws Exception {
        // Create first
        CreateCategoryRequest request = new CreateCategoryRequest();
        request.setName("DeleteMe");

        String response = mockMvc.perform(post("/api/v1/categories")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andReturn().getResponse().getContentAsString();

        Long id = objectMapper.readTree(response).get("id").asLong();

        mockMvc.perform(delete("/api/v1/categories/" + id))
                .andExpect(status().isNoContent());
    }

    @Test
    void getNonExistentCategory_returns404() throws Exception {
        mockMvc.perform(get("/api/v1/categories/99999"))
                .andExpect(status().isNotFound());
    }
}
