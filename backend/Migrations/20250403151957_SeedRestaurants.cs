using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

#pragma warning disable CA1814 // Prefer jagged arrays over multidimensional

namespace FoodReviewAPI.Migrations
{
    /// <inheritdoc />
    public partial class SeedRestaurants : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.InsertData(
                table: "Restaurants",
                columns: new[] { "Id", "Address", "AverageRating", "CreatedAt", "Description", "ImageUrl", "Name", "PhoneNumber", "Website" },
                values: new object[,]
                {
                    { 1, "123 Main St", 4.5, new DateTime(2025, 4, 3, 15, 19, 57, 73, DateTimeKind.Utc).AddTicks(5704), "Authentic Italian cuisine in a cozy atmosphere", "https://example.com/italian.jpg", "The Italian Place", "555-0123", "www.italianplace.com" },
                    { 2, "456 Oak Ave", 4.7999999999999998, new DateTime(2025, 4, 3, 15, 19, 57, 73, DateTimeKind.Utc).AddTicks(5707), "Fresh and delicious Japanese sushi", "https://example.com/sushi.jpg", "Sushi Master", "555-0124", "www.sushimaster.com" },
                    { 3, "789 Pine St", 4.2000000000000002, new DateTime(2025, 4, 3, 15, 19, 57, 73, DateTimeKind.Utc).AddTicks(5709), "Gourmet burgers and craft beers", "https://example.com/burger.jpg", "Burger Haven", "555-0125", "www.burgerhaven.com" }
                });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DeleteData(
                table: "Restaurants",
                keyColumn: "Id",
                keyValue: 1);

            migrationBuilder.DeleteData(
                table: "Restaurants",
                keyColumn: "Id",
                keyValue: 2);

            migrationBuilder.DeleteData(
                table: "Restaurants",
                keyColumn: "Id",
                keyValue: 3);
        }
    }
}
