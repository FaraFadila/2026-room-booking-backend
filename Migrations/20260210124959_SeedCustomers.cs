using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

#pragma warning disable CA1814 // Prefer jagged arrays over multidimensional

namespace _2026_room_booking_backend.Migrations
{
    /// <inheritdoc />
    public partial class SeedCustomers : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.InsertData(
                table: "Customers",
                columns: new[] { "Id", "Address", "CreatedAt", "Email", "IsActive", "IsDeleted", "Name", "Phone" },
                values: new object[,]
                {
                    { 1, "Surabaya", new DateTime(2026, 2, 10, 12, 49, 58, 976, DateTimeKind.Utc).AddTicks(5736), "alice@gmail.com", true, false, "Alice", "081234567890" },
                    { 2, "Sidoarjo", new DateTime(2026, 2, 10, 12, 49, 58, 976, DateTimeKind.Utc).AddTicks(5741), "bob@gmail.com", true, false, "Bob", "089876543210" }
                });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DeleteData(
                table: "Customers",
                keyColumn: "Id",
                keyValue: 1);

            migrationBuilder.DeleteData(
                table: "Customers",
                keyColumn: "Id",
                keyValue: 2);
        }
    }
}
