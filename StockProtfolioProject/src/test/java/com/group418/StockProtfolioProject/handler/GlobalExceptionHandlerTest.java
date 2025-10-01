package com.group418.StockProtfolioProject.handler;

import com.group418.StockProtfolioProject.exception.ResourceNotFoundException;
import org.junit.jupiter.api.Test;
import org.springframework.http.ResponseEntity;

import java.util.Map;

import static org.junit.jupiter.api.Assertions.*;

class GlobalExceptionHandlerTest {

    private final GlobalExceptionHandler handler = new GlobalExceptionHandler();

    @SuppressWarnings({ "deprecation", "null" })
    @Test
    void testHandleResourceNotFound() {
        // Arrange
        String message = "Portfolio not found";
        ResourceNotFoundException ex = new ResourceNotFoundException(message);

        // Act
        ResponseEntity<Map<String, Object>> response = handler.handleResourceNotFound(ex);

        // Assert
        assertEquals(404, response.getStatusCodeValue());
        assertNotNull(response.getBody());
        assertEquals(404, response.getBody().get("status"));
        assertEquals("Resource Not Found", response.getBody().get("error"));
        assertEquals(message, response.getBody().get("message"));
    }
}

