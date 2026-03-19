# Use the lightweight Alpine Linux version of Postgres
FROM postgres:16-alpine

# Set default environment variables (you can override these when running the container)
ENV POSTGRES_USER=postgres
ENV POSTGRES_PASSWORD=mysecretpassword
ENV POSTGRES_DB=tracker_db

# Copy your SQL script into the initialization directory
COPY init.sql /docker-entrypoint-initdb.d/