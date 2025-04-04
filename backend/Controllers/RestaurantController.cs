using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using Microsoft.EntityFrameworkCore;
using FoodReviewAPI.Data;
using FoodReviewAPI.Models;
using FoodReviewAPI.DTOs;

namespace FoodReviewAPI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class RestaurantController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public RestaurantController(ApplicationDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        [AllowAnonymous]
        public async Task<ActionResult<IEnumerable<RestaurantResponseDTO>>> GetRestaurants()
        {
            var restaurants = await _context.Restaurants
                .OrderByDescending(r => r.AverageRating)
                .Select(r => new RestaurantResponseDTO
                {
                    Id = r.Id,
                    Name = r.Name,
                    Description = r.Description,
                    Address = r.Address,
                    PhoneNumber = r.PhoneNumber,
                    Website = r.Website,
                    ImageUrl = r.ImageUrl,
                    AverageRating = r.AverageRating,
                    CreatedAt = r.CreatedAt
                })
                .ToListAsync();

            return restaurants;
        }

        [HttpGet("{id}")]
        [AllowAnonymous]
        public async Task<ActionResult<RestaurantResponseDTO>> GetRestaurant(int id)
        {
            var restaurant = await _context.Restaurants.FindAsync(id);

            if (restaurant == null)
            {
                return NotFound();
            }

            return new RestaurantResponseDTO
            {
                Id = restaurant.Id,
                Name = restaurant.Name,
                Description = restaurant.Description,
                Address = restaurant.Address,
                PhoneNumber = restaurant.PhoneNumber,
                Website = restaurant.Website,
                ImageUrl = restaurant.ImageUrl,
                AverageRating = restaurant.AverageRating,
                CreatedAt = restaurant.CreatedAt
            };
        }

        [HttpPost]
        [Authorize(Roles = "Admin")]
        public async Task<ActionResult<RestaurantResponseDTO>> CreateRestaurant(CreateRestaurantDTO restaurantDto)
        {
            var restaurant = new Restaurant
            {
                Name = restaurantDto.Name,
                Description = restaurantDto.Description,
                Address = restaurantDto.Address,
                PhoneNumber = restaurantDto.PhoneNumber,
                Website = restaurantDto.Website,
                ImageUrl = restaurantDto.ImageUrl
            };

            _context.Restaurants.Add(restaurant);
            await _context.SaveChangesAsync();

            return new RestaurantResponseDTO
            {
                Id = restaurant.Id,
                Name = restaurant.Name,
                Description = restaurant.Description,
                Address = restaurant.Address,
                PhoneNumber = restaurant.PhoneNumber,
                Website = restaurant.Website,
                ImageUrl = restaurant.ImageUrl,
                AverageRating = restaurant.AverageRating,
                CreatedAt = restaurant.CreatedAt
            };
        }

        [HttpPut("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> UpdateRestaurant(int id, UpdateRestaurantDTO restaurantDto)
        {
            var restaurant = await _context.Restaurants.FindAsync(id);

            if (restaurant == null)
            {
                return NotFound();
            }

            restaurant.Name = restaurantDto.Name;
            restaurant.Description = restaurantDto.Description;
            restaurant.Address = restaurantDto.Address;
            restaurant.PhoneNumber = restaurantDto.PhoneNumber;
            restaurant.Website = restaurantDto.Website;
            restaurant.ImageUrl = restaurantDto.ImageUrl;

            await _context.SaveChangesAsync();

            return NoContent();
        }

        [HttpDelete("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> DeleteRestaurant(int id)
        {
            var restaurant = await _context.Restaurants.FindAsync(id);

            if (restaurant == null)
            {
                return NotFound();
            }

            _context.Restaurants.Remove(restaurant);
            await _context.SaveChangesAsync();

            return NoContent();
        }
    }
} 