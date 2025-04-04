using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace FoodReviewAPI.Migrations
{
    /// <inheritdoc />
    public partial class UpdateRestaurantImages : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.UpdateData(
                table: "Restaurants",
                keyColumn: "Id",
                keyValue: 1,
                columns: new[] { "CreatedAt", "ImageUrl" },
                values: new object[] { new DateTime(2025, 4, 3, 15, 23, 30, 733, DateTimeKind.Utc).AddTicks(6263), "/assets/images/restaurant1.jpg" });

            migrationBuilder.UpdateData(
                table: "Restaurants",
                keyColumn: "Id",
                keyValue: 2,
                columns: new[] { "CreatedAt", "ImageUrl" },
                values: new object[] { new DateTime(2025, 4, 3, 15, 23, 30, 733, DateTimeKind.Utc).AddTicks(6266), "/assets/images/restaurant2.jpg" });

            migrationBuilder.UpdateData(
                table: "Restaurants",
                keyColumn: "Id",
                keyValue: 3,
                columns: new[] { "CreatedAt", "ImageUrl" },
                values: new object[] { new DateTime(2025, 4, 3, 15, 23, 30, 733, DateTimeKind.Utc).AddTicks(6268), "/assets/images/restaurant3.jpg" });

            migrationBuilder.InsertData(
                table: "Restaurants",
                columns: new[] { "Id", "Address", "AverageRating", "CreatedAt", "Description", "ImageUrl", "Name", "PhoneNumber", "Website" },
                values: new object[] { 4, "321 Spice St", 4.5999999999999996, new DateTime(2025, 4, 3, 15, 23, 30, 733, DateTimeKind.Utc).AddTicks(6270), "Authentic Mexican street food and margaritas", "/assets/images/restaurant4.jpg", "Taco Fiesta", "555-0126", "www.tacofiesta.com" });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DeleteData(
                table: "Restaurants",
                keyColumn: "Id",
                keyValue: 4);

            migrationBuilder.UpdateData(
                table: "Restaurants",
                keyColumn: "Id",
                keyValue: 1,
                columns: new[] { "CreatedAt", "ImageUrl" },
                values: new object[] { new DateTime(2025, 4, 3, 15, 19, 57, 73, DateTimeKind.Utc).AddTicks(5704), "https://example.com/italian.jpg" });

            migrationBuilder.UpdateData(
                table: "Restaurants",
                keyColumn: "Id",
                keyValue: 2,
                columns: new[] { "CreatedAt", "ImageUrl" },
                values: new object[] { new DateTime(2025, 4, 3, 15, 19, 57, 73, DateTimeKind.Utc).AddTicks(5707), "https://example.com/sushi.jpg" });

            migrationBuilder.UpdateData(
                table: "Restaurants",
                keyColumn: "Id",
                keyValue: 3,
                columns: new[] { "CreatedAt", "ImageUrl" },
                values: new object[] { new DateTime(2025, 4, 3, 15, 19, 57, 73, DateTimeKind.Utc).AddTicks(5709), "https://example.com/burger.jpg" });
        }
    }
}
