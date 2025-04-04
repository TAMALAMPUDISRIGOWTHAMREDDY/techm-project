using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using Microsoft.EntityFrameworkCore;
using FoodReviewAPI.Data;
using FoodReviewAPI.Models;
using FoodReviewAPI.DTOs;
using System.Security.Claims;

namespace FoodReviewAPI.Controllers
{
    [Authorize]
    [ApiController]
    [Route("api/[controller]")]
    public class ReviewController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public ReviewController(ApplicationDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        [AllowAnonymous]
        public async Task<ActionResult<IEnumerable<ReviewResponseDTO>>> GetReviews()
        {
            var reviews = await _context.Reviews
                .Include(r => r.User)
                .Include(r => r.Restaurant)
                .OrderByDescending(r => r.CreatedAt)
                .Select(r => new ReviewResponseDTO
                {
                    Id = r.Id,
                    RestaurantName = r.Restaurant.Name,
                    Content = r.Content,
                    Rating = r.Rating,
                    FoodImage = r.FoodImage,
                    CreatedAt = r.CreatedAt,
                    Username = r.User.Username,
                    Restaurant = new RestaurantInfo
                    {
                        Id = r.Restaurant.Id,
                        Name = r.Restaurant.Name,
                        ImageUrl = r.Restaurant.ImageUrl
                    }
                })
                .ToListAsync();

            return Ok(reviews);
        }

        [HttpGet("{id}")]
        [AllowAnonymous]
        public async Task<ActionResult<ReviewResponseDTO>> GetReview(int id)
        {
            var review = await _context.Reviews
                .Include(r => r.User)
                .Include(r => r.Restaurant)
                .FirstOrDefaultAsync(r => r.Id == id);

            if (review == null)
            {
                return NotFound();
            }

            var reviewDto = new ReviewResponseDTO
            {
                Id = review.Id,
                RestaurantName = review.Restaurant.Name,
                Content = review.Content,
                Rating = review.Rating,
                FoodImage = review.FoodImage,
                CreatedAt = review.CreatedAt,
                Username = review.User.Username,
                Restaurant = new RestaurantInfo
                {
                    Id = review.Restaurant.Id,
                    Name = review.Restaurant.Name,
                    ImageUrl = review.Restaurant.ImageUrl
                }
            };

            return Ok(reviewDto);
        }

        [HttpPost]
        public async Task<ActionResult<ReviewResponseDTO>> CreateReview([FromBody] CreateReviewDTO reviewDto)
        {
            var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value!);
            var user = await _context.Users.FindAsync(userId);

            if (user == null)
            {
                return NotFound("User not found");
            }

            var restaurant = await _context.Restaurants.FindAsync(reviewDto.RestaurantId);
            if (restaurant == null)
            {
                return NotFound("Restaurant not found");
            }

            var review = new Review
            {
                UserId = userId,
                RestaurantId = reviewDto.RestaurantId,
                Content = reviewDto.Content,
                Rating = reviewDto.Rating,
                FoodImage = reviewDto.FoodImage,
                CreatedAt = DateTime.UtcNow
            };

            _context.Reviews.Add(review);
            await _context.SaveChangesAsync();

            var createdReview = await _context.Reviews
                .Include(r => r.User)
                .Include(r => r.Restaurant)
                .FirstOrDefaultAsync(r => r.Id == review.Id);

            var responseDto = new ReviewResponseDTO
            {
                Id = createdReview!.Id,
                RestaurantName = createdReview.Restaurant.Name,
                Content = createdReview.Content,
                Rating = createdReview.Rating,
                FoodImage = createdReview.FoodImage,
                CreatedAt = createdReview.CreatedAt,
                Username = createdReview.User.Username,
                Restaurant = new RestaurantInfo
                {
                    Id = createdReview.Restaurant.Id,
                    Name = createdReview.Restaurant.Name,
                    ImageUrl = createdReview.Restaurant.ImageUrl
                }
            };

            return CreatedAtAction(nameof(GetReview), new { id = review.Id }, responseDto);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateReview(int id, [FromBody] UpdateReviewDTO reviewDto)
        {
            var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value!);
            var review = await _context.Reviews.FindAsync(id);

            if (review == null)
            {
                return NotFound();
            }

            if (review.UserId != userId)
            {
                return Forbid();
            }

            review.Content = reviewDto.Content;
            review.Rating = reviewDto.Rating;
            if (!string.IsNullOrEmpty(reviewDto.FoodImage))
            {
                review.FoodImage = reviewDto.FoodImage;
            }

            await _context.SaveChangesAsync();
            return NoContent();
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteReview(int id)
        {
            var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value!);
            var review = await _context.Reviews.FindAsync(id);

            if (review == null)
            {
                return NotFound();
            }

            if (review.UserId != userId)
            {
                return Forbid();
            }

            _context.Reviews.Remove(review);
            await _context.SaveChangesAsync();
            return NoContent();
        }

        [HttpGet("user")]
        public async Task<ActionResult<IEnumerable<ReviewResponseDTO>>> GetUserReviews()
        {
            var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value!);
            var reviews = await _context.Reviews
                .Include(r => r.User)
                .Include(r => r.Restaurant)
                .Where(r => r.UserId == userId)
                .OrderByDescending(r => r.CreatedAt)
                .Select(r => new ReviewResponseDTO
                {
                    Id = r.Id,
                    RestaurantName = r.Restaurant.Name,
                    Content = r.Content,
                    Rating = r.Rating,
                    FoodImage = r.FoodImage,
                    CreatedAt = r.CreatedAt,
                    Username = r.User.Username,
                    Restaurant = new RestaurantInfo
                    {
                        Id = r.Restaurant.Id,
                        Name = r.Restaurant.Name,
                        ImageUrl = r.Restaurant.ImageUrl
                    }
                })
                .ToListAsync();

            return Ok(reviews);
        }

        [AllowAnonymous]
        [HttpGet("restaurant/{restaurantId}")]
        public async Task<ActionResult<IEnumerable<ReviewResponseDTO>>> GetRestaurantReviews(
            int restaurantId,
            [FromQuery] int page = 1,
            [FromQuery] int pageSize = 10)
        {
            var skip = (page - 1) * pageSize;
            
            var reviews = await _context.Reviews
                .Include(r => r.User)
                .Include(r => r.Restaurant)
                .Where(r => r.RestaurantId == restaurantId)
                .OrderByDescending(r => r.CreatedAt)
                .Skip(skip)
                .Take(pageSize)
                .Select(r => new ReviewResponseDTO
                {
                    Id = r.Id,
                    RestaurantName = r.Restaurant.Name,
                    Content = r.Content,
                    Rating = r.Rating,
                    FoodImage = r.FoodImage,
                    CreatedAt = r.CreatedAt,
                    Username = r.User.Username,
                    Restaurant = new RestaurantInfo
                    {
                        Id = r.Restaurant.Id,
                        Name = r.Restaurant.Name,
                        ImageUrl = r.Restaurant.ImageUrl
                    }
                })
                .ToListAsync();

            return Ok(reviews);
        }
    }
} 