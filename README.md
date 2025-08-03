# Headhunt Platform - Microservices Project

This repository contains the source code for the Headhunt Platform, a comprehensive system for managing candidates, clients, jobs, and interviews. The platform is built using a microservices architecture, with each service designed to be independently developed, deployed, and scaled.

---

## High-Level Architecture

This project is designed to run on a cloud infrastructure like AWS, using EC2 instances for hosting the services.

* **Frontend:** A React single-page application that provides the user interface for both clients and internal staff.
* **Backend Services:** A collection of Node.js/Express microservices, each responsible for a specific business domain (e.g., authentication, job management).
* **API Gateway:** An Nginx reverse proxy that acts as the single entry point for all frontend requests, routing them to the appropriate backend service.
* **Database:** A PostgreSQL database to store all application data.
* **Containerization:** All services, including the frontend, are containerized using Docker for consistent development and deployment environments.

---

## Project Structure

The project is organized as a monorepo, which simplifies dependency management and cross-service development.

```text
/headhunt-platform/
|
|-- /frontend/                 # React Single Page Application
|   |-- /src/
|   |-- package.json
|   `-- Dockerfile
|
|-- /services/                 # All backend microservices
|   |
|   |-- /auth-service/         # Authentication Service
|   |   |-- /src/
|   |   |-- package.json
|   |   `-- Dockerfile
|   |
|   |-- /job-service/          # Job Management Service
|   |
|   |-- /candidate-service/    # Candidate Management Service
|   |
|   `-- /shared/               # Shared libraries and utilities
|
|-- docker-compose.yml         # For local development and testing
|
`-- README.md
