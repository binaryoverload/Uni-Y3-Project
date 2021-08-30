FROM maven:3-jdk-11 AS build

WORKDIR /app

COPY pom.xml ./

RUN mvn dependency:go-offline

COPY src ./src

RUN mvn package

FROM adoptopenjdk/openjdk11:jre-11.0.11_9-alpine

WORKDIR /app

COPY --from=build /app/target/spm-backend-jar-with-dependencies.jar spm-backend.jar

CMD ["java", "-jar", "spm-backend.jar"]