PENS Room Booking — Backend API

## Overview
PENS Room Booking Backend is a RESTful API built with ASP.NET Core 8 to manage customer data for the Room Booking System.
The project follows a clean Git workflow (feature branching, pull requests, semantic versioning) and uses Entity Framework Core with SQLite for data persistence.

## Features
- Full Customer CRUD operations
- Pagination and search support
- Soft delete implementation
- DTO-based validation
- Entity Framework Core migrations
- Database seeding
- Interactive API documentation via Swagger

## Tech Stack
- ASP.NET Core 8 (Web API)
- Entity Framework Core 8
- SQLite
- Swagger / OpenAPI

## Getting Started
1. Clone Repository
   git clone https://github.com/FaraFadila/2026-room-booking-backend.git
   cd 2026-room-booking-backend
2. Restore Dependencies
   dotnet restore
3. Apply Database Migration
   dotnet ef database update
4. Run the Application
   dotnet run
   
The API will run at: http://localhost:5083/index.html
Swagger UI: http://localhost:5083/swagger

## Project Structure
Controllers/     → API endpoints
Models/          → Entity models
Dtos/            → Data transfer objects
Data/            → DbContext & configuration
Migrations/      → EF Core migrations

## Version
Current version : v1.0.0

## Author 
FaraFadila
