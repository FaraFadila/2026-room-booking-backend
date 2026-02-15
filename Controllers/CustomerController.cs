using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Authorization;
using Data;
using Models;
using Dtos;

namespace Controllers;

[Authorize]                        // require authentication for all endpoints
[ApiController]
[Route("api/[controller]")]
public class CustomerController : ControllerBase
{
    private readonly AppDbContext _context;

    public CustomerController(AppDbContext context)
    {
        _context = context;
    }

    // ================= GET ALL =================
    // supports optional search (by name or email) and simple paging
    [HttpGet]
    public async Task<IActionResult> GetAll(string? search = null, int page = 1, int pageSize = 20)
    {
        var query = _context.Customers
            .Where(c => !c.IsDeleted);

        if (!string.IsNullOrWhiteSpace(search))
        {
            query = query.Where(c => c.Name.Contains(search) || c.Email.Contains(search));
        }

        var totalCount = await query.CountAsync();
        var customers = await query
            .OrderBy(c => c.Name)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync();

        return Ok(new { totalCount, page, pageSize, customers });
    }

    // ================= GET BY ID =================
    [HttpGet("{id}")]
    public async Task<IActionResult> GetById(int id)
    {
        var customer = await _context.Customers
            .FirstOrDefaultAsync(c => c.Id == id && !c.IsDeleted);

        if (customer == null)
            return NotFound();

        return Ok(customer);
    }

    // ================= CREATE =================
    [Authorize(Roles = "Admin")]
    [HttpPost]
    public async Task<IActionResult> Create(CreateCustomerDto dto)
    {
        if (!ModelState.IsValid)
            return BadRequest(ModelState);

        var customer = new Customer
        {
            Name = dto.Name,
            Email = dto.Email,
            Phone = dto.Phone,
            Address = dto.Address,
            CreatedAt = DateTime.UtcNow,
            IsDeleted = false,
            IsActive = true
        };

        _context.Customers.Add(customer);
        await _context.SaveChangesAsync();

        return Ok(customer);
    }

    // ================= UPDATE =================
    [Authorize(Roles = "Admin")]
    [HttpPut("{id}")]
    public async Task<IActionResult> Update(int id, UpdateCustomerDto dto)
    {
        if (!ModelState.IsValid)
            return BadRequest(ModelState);

        var customer = await _context.Customers.FindAsync(id);

        if (customer == null || customer.IsDeleted)
            return NotFound();

        customer.Name = dto.Name;
        customer.Email = dto.Email;
        customer.Phone = dto.Phone;
        customer.Address = dto.Address;
        customer.IsActive = dto.IsActive;

        await _context.SaveChangesAsync();

        return Ok(customer);
    }

    // ================= DELETE (SOFT DELETE) =================
    [Authorize(Roles = "Admin")]
    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(int id)
    {
        var customer = await _context.Customers.FindAsync(id);

        if (customer == null || customer.IsDeleted)
            return NotFound();

        customer.IsDeleted = true;

        await _context.SaveChangesAsync();

        return Ok("Customer deleted successfully.");
    }
}
