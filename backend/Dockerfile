# ─── Build stage (Maven + JDK 21 bundled) ────────────────────────────────────
FROM maven:3.9-eclipse-temurin-21-alpine AS build
WORKDIR /workspace

# Copy pom.xml first — Maven dependency layer caches here
COPY pom.xml .
RUN mvn dependency:go-offline -B --no-transfer-progress

# Copy source (migrations are bundled in src/main/resources/db/migration)
COPY src ./src

# Build the JAR
RUN mvn package -DskipTests -B --no-transfer-progress

# ─── Runtime stage (JRE only — smaller image) ────────────────────────────────
FROM eclipse-temurin:21-jre-alpine
WORKDIR /app

COPY --from=build /workspace/target/*.jar app.jar

EXPOSE 8080

ENTRYPOINT ["java", "-jar", "app.jar"]
