using System.ComponentModel.DataAnnotations;

public class UpdateCustomerDto
{
    [Required]
    public string Name { get; set; } = null!;

    [Required, EmailAddress]
    public string Email { get; set; } = null!;

    public string? Phone { get; set; }
    public string? Address { get; set; }

    public bool IsActive { get; set; }
}
