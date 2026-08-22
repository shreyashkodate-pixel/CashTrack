# ─── Build stage ─────────────────────────────────────────────────────────────
FROM eclipse-temurin:21-jdk-alpine AS build
WORKDIR /workspace

# Copy pom.xml first so Maven dependency layer can be cached
COPY pom.xml .

# Copy source (migrations are bundled inside src/main/resources/db/migration)
COPY src ./src

# Build the JAR, skipping tests for faster CI builds
RUN mvn package -DskipTests -B --no-transfer-progress

# ─── Runtime stage ───────────────────────────────────────────────────────────
FROM eclipse-temurin:21-jre-alpine
WORKDIR /app

# Copy the built JAR only — migrations are baked into the classpath
COPY --from=build /workspace/target/*.jar app.jar

EXPOSE 8080

ENTRYPOINT ["java", "-jar", "app.jar"]
