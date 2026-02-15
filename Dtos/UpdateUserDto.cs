using Models.Enums;

namespace Dtos;

public class UpdateUserDto
{
    public string FullName { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    // optional new password; if provided we'll hash and update
    public string? Password { get; set; }
    // role can only be changed by admin
    public UserRole? Role { get; set; }
}