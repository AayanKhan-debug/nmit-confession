package com.nmit.confessions.controller;

import com.nmit.confessions.dto.AdminDashboardResponse;
import com.nmit.confessions.service.AdminDashboardService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class AdminDashboardControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private AdminDashboardService dashboardService;

    private AdminDashboardResponse mockResponse;

    @BeforeEach
    void setUp() {
        mockResponse = new AdminDashboardResponse();
        mockResponse.setPendingConfessions(10);
        mockResponse.setFlaggedPendingConfessions(2);
        mockResponse.setPendingReports(5);
        mockResponse.setHiddenConfessions(3);
        mockResponse.setPublishedConfessions(100);
        mockResponse.setRejectedConfessions(1);
    }

    @Test
    void unauthenticatedRequestRejected() throws Exception {
        mockMvc.perform(get("/api/admin/dashboard"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @WithMockUser(roles = "USER")
    void normalUserRejected() throws Exception {
        mockMvc.perform(get("/api/admin/dashboard"))
                .andExpect(status().isForbidden());
    }

    @Test
    @WithMockUser(roles = "MODERATOR")
    void moderatorAllowed() throws Exception {
        when(dashboardService.getDashboardMetrics()).thenReturn(mockResponse);
        
        mockMvc.perform(get("/api/admin/dashboard"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.pendingConfessions").value(10))
                .andExpect(jsonPath("$.publishedConfessions").value(100));
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    void adminAllowed() throws Exception {
        when(dashboardService.getDashboardMetrics()).thenReturn(mockResponse);

        mockMvc.perform(get("/api/admin/dashboard"))
                .andExpect(status().isOk());
    }
}
