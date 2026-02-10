using System.ComponentModel.DataAnnotations;

namespace Models;
public class Customer
{
    public int Id { get; set; }

    [Required]
    public string Name { get; set; } = null!;

    [Required, EmailAddress]
    public string Email { get; set; } = null!;

    public string? Phone { get; set; }
    public string? Address { get; set; }

    public bool IsActive { get; set; } = true;
    public bool IsDeleted { get; set; } = false;

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}
