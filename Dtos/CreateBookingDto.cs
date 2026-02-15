using System.ComponentModel.DataAnnotations;

namespace Dtos;

public class CreateBookingDto
{
    // identifier of an existing customer (optional).  if omitted the
    // booking will still be created but won't be linked to a customer.
    public int? CustomerId { get; set; }

    [Required]
    public int RoomId { get; set; }

    [Required]
    public DateTime StartTime { get; set; }

    [Required]
    public DateTime EndTime { get; set; }

    public string? Purpose { get; set; }
}
