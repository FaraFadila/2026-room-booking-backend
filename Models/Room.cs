using System.ComponentModel.DataAnnotations;

namespace Models;

public class Room
{
    public int Id { get; set; }

    [Required]
    public string Name { get; set; } = string.Empty;

    public int Capacity { get; set; }

    public string Location { get; set; } = string.Empty;

    public bool IsAvailable { get; set; } = true;

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}
