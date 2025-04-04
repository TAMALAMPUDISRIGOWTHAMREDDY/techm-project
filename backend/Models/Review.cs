using System.ComponentModel.DataAnnotations;

namespace FoodReviewAPI.Models
{
    public class Review
    {
        public int Id { get; set; }

        [Required]
        public int UserId { get; set; }
        public User User { get; set; }

        [Required]
        public int RestaurantId { get; set; }
        public Restaurant Restaurant { get; set; }

        [Required]
        [StringLength(500)]
        public string Content { get; set; }

        [Required]
        [Range(1, 5)]
        public int Rating { get; set; }

        public string? FoodImage { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }
} 