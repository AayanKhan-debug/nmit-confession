package com.nmit.confessions.security;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.nmit.confessions.dto.LoginRequest;
import com.nmit.confessions.entity.Admin;
import com.nmit.confessions.enums.AdminRole;
import com.nmit.confessions.repository.AdminRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.mock.web.MockHttpSession;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.header;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
public class AuthControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private AdminRepository adminRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private ObjectMapper objectMapper;

    @BeforeEach
    void setUp() {
        adminRepository.deleteAll();
        Admin admin = new Admin();
        admin.setUsername("testadmin");
        admin.setPasswordHash(passwordEncoder.encode("password123"));
        admin.setRole(AdminRole.ADMIN);
        adminRepository.save(admin);
    }

    @Test
    void testLoginSuccess() throws Exception {
        LoginRequest request = new LoginRequest();
        request.setUsername("testadmin");
        request.setPassword("password123");

        mockMvc.perform(post("/api/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.message").value("Login successful"))
                .andExpect(jsonPath("$.username").value("testadmin"))
                .andExpect(jsonPath("$.role").value("ADMIN"));
    }

    @Test
    void testLoginFailureWrongPassword() throws Exception {
        LoginRequest request = new LoginRequest();
        request.setUsername("testadmin");
        request.setPassword("wrongpassword");

        mockMvc.perform(post("/api/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.error").value("Invalid username or password"));
    }

    @Test
    void testLoginMissingCredentials() throws Exception {
        LoginRequest request = new LoginRequest();

        mockMvc.perform(post("/api/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest());
    }

    @Test
    void testMeEndpointWithSession() throws Exception {
        LoginRequest request = new LoginRequest();
        request.setUsername("testadmin");
        request.setPassword("password123");

        MvcResult result = mockMvc.perform(post("/api/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andReturn();

        MockHttpSession session = (MockHttpSession) result.getRequest().getSession();

        mockMvc.perform(get("/api/auth/me")
                .session(session))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.username").value("testadmin"))
                .andExpect(jsonPath("$.role").value("ADMIN"));
    }

    @Test
    void testMeEndpointWithoutSession() throws Exception {
        mockMvc.perform(get("/api/auth/me"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void testLogout() throws Exception {
        LoginRequest request = new LoginRequest();
        request.setUsername("testadmin");
        request.setPassword("password123");

        MvcResult result = mockMvc.perform(post("/api/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andReturn();

        MockHttpSession session = (MockHttpSession) result.getRequest().getSession();

        mockMvc.perform(post("/api/auth/logout")
                .session(session))
                .andExpect(status().isNoContent());

        mockMvc.perform(get("/api/auth/me")
                .session(session))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void testCsrfEndpointReturnsTokenAndExposesHeader() throws Exception {
        MvcResult result = mockMvc.perform(get("/api/auth/csrf"))
                .andExpect(status().isNoContent())
                .andExpect(header().exists("X-XSRF-TOKEN"))
                .andExpect(header().exists("X-CSRF-TOKEN"))
                .andReturn();

        String token = result.getResponse().getHeader("X-XSRF-TOKEN");
        assertThat(token).isNotBlank();
        assertThat(result.getResponse().getHeader("X-CSRF-TOKEN")).isEqualTo(token);
    }
}
