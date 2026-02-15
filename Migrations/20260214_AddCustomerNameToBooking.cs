using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace _2026_room_booking_backend.Migrations
{
    public partial class AddCustomerNameToBooking : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "CustomerName",
                table: "Bookings",
                type: "TEXT",
                nullable: true);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "CustomerName",
                table: "Bookings");
        }
    }
}
