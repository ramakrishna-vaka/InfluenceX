FROM eclipse-temurin:21-jdk

WORKDIR /app

COPY . .

# give execute permission to gradlew
RUN chmod +x gradlew

# build project
RUN ./gradlew build -x test

EXPOSE 8080

CMD ["sh", "-c", "java -jar build/libs/*.jar"]