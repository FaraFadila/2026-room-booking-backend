using System.ComponentModel.DataAnnotations;
using Models.Enums;
using Models.Auth;

namespace Models;

public class Booking
{
    public int Id { get; set; }

    [Required]
    public int UserId { get; set; }

    [Required]
    public int RoomId { get; set; }

    [Required]
    public DateTime StartTime { get; set; }

    [Required]
    public DateTime EndTime { get; set; }

    public string? Purpose { get; set; }

    public BookingStatus Status { get; set; } = BookingStatus.Pending;

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public User? User { get; set; }
    public Room? Room { get; set; }

    // optional name provided when the booking is created (e.g. guest name)
    // foreign key to a customer record (optional)
    public int? CustomerId { get; set; }
    public Customer? Customer { get; set; }
}
