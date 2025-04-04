namespace FoodReviewAPI.DTOs
{
    public class RestaurantResponseDTO
    {
        public int Id { get; set; }
        public string Name { get; set; }
        public string Description { get; set; }
        public string Address { get; set; }
        public string PhoneNumber { get; set; }
        public string Website { get; set; }
        public string ImageUrl { get; set; }
        public double AverageRating { get; set; }
        public DateTime CreatedAt { get; set; }
    }

    public class CreateRestaurantDTO
    {
        public string Name { get; set; }
        public string Description { get; set; }
        public string Address { get; set; }
        public string PhoneNumber { get; set; }
        public string Website { get; set; }
        public string ImageUrl { get; set; }
    }

    public class UpdateRestaurantDTO
    {
        public string Name { get; set; }
        public string Description { get; set; }
        public string Address { get; set; }
        public string PhoneNumber { get; set; }
        public string Website { get; set; }
        public string ImageUrl { get; set; }
    }
} 