# Stage 1: Build the application with Maven
FROM maven:3.9.9-eclipse-temurin-17-alpine AS builder

WORKDIR /app

# Cache dependencies by copying pom.xml first
COPY pom.xml .
RUN mvn dependency:go-offline -B

# Copy source code and package application
COPY src ./src
RUN mvn clean package -DskipTests

# Stage 2: Create lightweight production JRE runtime image
FROM eclipse-temurin:17-jre-alpine

WORKDIR /app

# Create a non-root system user for security
RUN addgroup -S appgroup && adduser -S appuser -G appgroup

# Copy the built jar from the builder stage
COPY --from=builder /app/target/website-scanner.jar app.jar

# Set ownership
RUN chown -R appuser:appgroup /app
USER appuser

# Cloud platforms (Render, Railway, Heroku) inject the PORT environment variable dynamically
ENV PORT=8080
EXPOSE 8080

# Run Spring Boot with optimized container memory settings
ENTRYPOINT ["sh", "-c", "java -XX:+UseContainerSupport -XX:MaxRAMPercentage=75.0 -Djava.security.egd=file:/dev/./urandom -jar app.jar"]
