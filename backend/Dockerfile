# ─── Build stage — uses Maven wrapper to ensure mvn is always available ──────
FROM eclipse-temurin:21-jdk-alpine AS build

# Install Maven explicitly via apk (most reliable approach on alpine)
RUN apk add --no-cache maven

WORKDIR /workspace

# Copy pom.xml first — dependency layer is cached separately
COPY pom.xml .
RUN mvn dependency:go-offline -B -q

# Copy Maven wrapper and source
COPY .mvn .mvn
COPY mvnw .
COPY src ./src

# Build the JAR (migrations are packaged inside via classpath)
RUN mvn package -DskipTests -B -q

# ─── Runtime stage — slim JRE only ───────────────────────────────────────────
FROM eclipse-temurin:21-jre-alpine
WORKDIR /app

COPY --from=build /workspace/target/*.jar app.jar

EXPOSE 8080

ENTRYPOINT ["java", "-jar", "app.jar"]
