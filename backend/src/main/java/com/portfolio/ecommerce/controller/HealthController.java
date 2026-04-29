package com.portfolio.ecommerce.controller;

import java.time.OffsetDateTime;
import java.util.Map;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class HealthController {

    @GetMapping({"/", "/api", "/api/"})
    public Map<String, Object> apiHome() {
        return Map.of(
                "app", "Northstar Shop API",
                "status", "UP",
                "health", "/api/health",
                "message", "Backend disponible. Usa /api/products para ver el catalogo publico."
        );
    }

    @GetMapping("/api/health")
    public Map<String, Object> health() {
        return Map.of(
                "app", "Northstar Shop API",
                "status", "UP",
                "timestamp", OffsetDateTime.now().toString()
        );
    }
}
