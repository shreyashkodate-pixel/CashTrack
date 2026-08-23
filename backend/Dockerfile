# ─── Build stage — official Maven 3.9 + JDK 21 image (most reliable) ─────────
FROM maven:3.9.9-eclipse-temurin-21 AS build

WORKDIR /workspace

# Copy pom.xml and download all dependencies first (layer cache optimization)
COPY pom.xml .
RUN mvn dependency:go-offline -B

# Copy source code (migrations bundled inside src/main/resources/db/migration)
COPY src ./src

# Build the production JAR
RUN mvn package -DskipTests -B

# ─── Runtime stage — slim JRE only for smaller final image ────────────────────
FROM eclipse-temurin:21-jre-jammy
WORKDIR /app

# Copy only the built JAR from the build stage
COPY --from=build /workspace/target/*.jar app.jar

EXPOSE 8080

ENTRYPOINT ["java", "-jar", "app.jar"]
