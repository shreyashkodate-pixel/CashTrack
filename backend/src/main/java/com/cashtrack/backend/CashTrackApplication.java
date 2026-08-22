package com.cashtrack.backend;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.Statement;
import java.sql.ResultSet;

@SpringBootApplication
public class CashTrackApplication {

    public static void main(String[] args) {
        createDatabaseIfNotExist();
        SpringApplication.run(CashTrackApplication.class, args);
    }

    private static void createDatabaseIfNotExist() {
        String host = System.getenv().getOrDefault("DB_HOST", "localhost");
        String port = System.getenv().getOrDefault("DB_PORT", "5432");
        String dbName = System.getenv().getOrDefault("DB_NAME", "cashtrack");
        String username = System.getenv().getOrDefault("DB_USERNAME", "cashtrack_app");
        String password = System.getenv().getOrDefault("DB_PASSWORD", "changeme");

        // Connect to the default 'postgres' database to check/create our target database
        String url = "jdbc:postgresql://" + host + ":" + port + "/postgres";

        try (Connection connection = DriverManager.getConnection(url, username, password);
             Statement statement = connection.createStatement()) {
             
            ResultSet resultSet = statement.executeQuery("SELECT 1 FROM pg_database WHERE datname = '" + dbName + "'");
            if (!resultSet.next()) {
                System.out.println("Database '" + dbName + "' does not exist. Auto-creating it now...");
                statement.executeUpdate("CREATE DATABASE " + dbName);
                System.out.println("Database '" + dbName + "' created successfully.");
            }
        } catch (Exception e) {
            System.err.println("Note: Auto-create database check failed (this is normal if the user lacks permissions or the DB already exists): " + e.getMessage());
        }
    }
}
