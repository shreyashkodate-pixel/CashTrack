package com.cashtrack.backend.config;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.info.Contact;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class OpenApiConfig {

    @Bean
    public OpenAPI cashTrackOpenAPI() {
        return new OpenAPI()
                .info(new Info()
                        .title("CashTrack API")
                        .description("CashTrack Personal Finance Management API — V1")
                        .version("1.0.0")
                        .contact(new Contact().name("CashTrack Team")));
    }
}
