using Microsoft.EntityFrameworkCore;
using Models;

namespace Data;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options)
        : base(options) { }

    public DbSet<Customer> Customers => Set<Customer>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        modelBuilder.Entity<Customer>().HasData(
            new Customer
            {
                Id = 1,
                Name = "Alice",
                Email = "alice@gmail.com",
                Phone = "081234567890",
                Address = "Surabaya",
                IsActive = true,
                IsDeleted = false,
                CreatedAt = DateTime.UtcNow
            },
            new Customer
            {
                Id = 2,
                Name = "Bob",
                Email = "bob@gmail.com",
                Phone = "089876543210",
                Address = "Sidoarjo",
                IsActive = true,
                IsDeleted = false,
                CreatedAt = DateTime.UtcNow
            }
        );
    }
}
