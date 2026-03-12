# Use Java 21 runtime
FROM eclipse-temurin:21-jdk

# Set working directory inside container
WORKDIR /app

# Copy project files into container
COPY . .

# Build the application
RUN ./gradlew build -x test

# Expose application port
EXPOSE 8080

# Run the jar
CMD ["sh", "-c", "java -jar build/libs/*.jar"]