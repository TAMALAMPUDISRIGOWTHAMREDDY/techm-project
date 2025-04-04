namespace FoodReviewAPI.DTOs
{
    public class CreateReviewDTO
    {
        public int RestaurantId { get; set; }
        public string Content { get; set; }
        public int Rating { get; set; }
        public string? FoodImage { get; set; }
    }

    public class UpdateReviewDTO
    {
        public string Content { get; set; }
        public int Rating { get; set; }
        public string? FoodImage { get; set; }
    }

    public class ReviewResponseDTO
    {
        public int Id { get; set; }
        public string RestaurantName { get; set; }
        public string Content { get; set; }
        public int Rating { get; set; }
        public string? FoodImage { get; set; }
        public DateTime CreatedAt { get; set; }
        public string Username { get; set; }
        public RestaurantInfo Restaurant { get; set; }
    }

    public class RestaurantInfo
    {
        public int Id { get; set; }
        public string Name { get; set; }
        public string ImageUrl { get; set; }
    }
} 