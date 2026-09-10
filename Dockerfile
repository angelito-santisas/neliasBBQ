FROM maven:3.9-eclipse-temurin-17 AS build
WORKDIR /build

COPY backend/pom.xml .
COPY backend/src ./src
RUN mvn -B package -DskipTests

FROM eclipse-temurin:17-jre
WORKDIR /app/backend

COPY --from=build /build/target/backend-0.0.1-SNAPSHOT.jar app.jar
COPY database/migrations /app/database/migrations

CMD ["java", "-jar", "app.jar"]