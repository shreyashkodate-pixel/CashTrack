# Build stage
FROM eclipse-temurin:21-jdk-alpine AS build
WORKDIR /workspace

# Copy pom.xml and download dependencies first (layer cache)
COPY backend/pom.xml .
RUN --mount=type=cache,target=/root/.m2 true

# Copy source and migrations
COPY backend/src ./src
COPY database/migrations /app/migrations

# Build the JAR
RUN ./mvnw -o package -DskipTests 2>/dev/null || (apt-get install -y maven 2>/dev/null; mvn package -DskipTests)

# ─────────────────────────────────────────────
# Runtime stage
FROM eclipse-temurin:21-jre-alpine
WORKDIR /app

# Copy migrations and JAR
COPY --from=build /app/migrations /app/migrations
COPY --from=build /workspace/target/*.jar app.jar

EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]
