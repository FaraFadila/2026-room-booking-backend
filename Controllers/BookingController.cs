using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Authorization;
using System.Security.Claims;
using Data;
using Models;
using Dtos;
using Models.Enums;

namespace Controllers;

[Authorize]
[ApiController]
[Route("api/[controller]")]
public class BookingController : ControllerBase
{
    private readonly AppDbContext _context;

    public BookingController(AppDbContext context)
    {
        _context = context;
    }

    [Authorize(Roles = "Admin,User")]
    [HttpPost]
    public async Task<IActionResult> Create(CreateBookingDto dto)
    {
        if (dto.EndTime <= dto.StartTime)
            return BadRequest("End time must be greater than start time.");

        var room = await _context.Rooms.FindAsync(dto.RoomId);
        if (room == null)
            return BadRequest("Room not found.");

        bool isConflict = await _context.Bookings.AnyAsync(b =>
            b.RoomId == dto.RoomId &&
            b.Status == BookingStatus.Approved &&
            dto.StartTime < b.EndTime &&
            dto.EndTime > b.StartTime
        );

        if (isConflict)
            return BadRequest("Room already booked for this time range.");

        var email = User.FindFirst(ClaimTypes.Name)?.Value;
        var user = await _context.Users.FirstOrDefaultAsync(u => u.Email == email);

        if (user == null)
            return Unauthorized();

        // verify customer exists if an id was supplied
        if (dto.CustomerId.HasValue)
        {
            var cust = await _context.Customers
                .FirstOrDefaultAsync(c => c.Id == dto.CustomerId.Value && !c.IsDeleted);
            if (cust == null)
                return BadRequest("Customer not found.");
        }

        var booking = new Booking
        {
            UserId = user.Id,
            RoomId = dto.RoomId,
            StartTime = dto.StartTime,
            EndTime = dto.EndTime,
            Purpose = dto.Purpose,
            // record the associated customer if provided; otherwise leave
            // null.  (user identity is already stored separately.)
            CustomerId = dto.CustomerId
        };

        _context.Bookings.Add(booking);
        await _context.SaveChangesAsync();

        return Ok(booking);
    }

    // GET: api/Booking
    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var email = User.Identity!.Name;
        var role = User.FindFirst(ClaimTypes.Role)?.Value;

        // Return all bookings for listing regardless of caller role.
        // Note: other endpoints (Get(id), Update, Delete) still enforce per-role access rules.
        var data = await _context.Bookings
            .Include(b => b.User)
            .Include(b => b.Room)
            .Include(b => b.Customer)
            .ToListAsync();

        return Ok(data);
    }

    // ADMIN ONLY: GET bookings by user id
    [Authorize(Roles = "Admin")]
    [HttpGet("user/{userId}")]
    public async Task<IActionResult> GetByUser(int userId)
    {
        var bookings = await _context.Bookings
            .Include(b => b.User)
            .Include(b => b.Room)
            .Include(b => b.Customer)
            .Where(b => b.UserId == userId)
            .ToListAsync();
        return Ok(bookings);
    }

    // GET: api/Booking/summary
    [HttpGet("summary")]
    public async Task<IActionResult> Summary()
    {
        var email = User.Identity!.Name;
        var role = User.FindFirst(ClaimTypes.Role)?.Value;

        // Return summary counts across all bookings regardless of caller role.
        var total = await _context.Bookings.CountAsync();
        var pending = await _context.Bookings.CountAsync(b => b.Status == BookingStatus.Pending);
        var approved = await _context.Bookings.CountAsync(b => b.Status == BookingStatus.Approved);
        var rejected = await _context.Bookings.CountAsync(b => b.Status == BookingStatus.Rejected);

        return Ok(new { total, pending, approved, rejected });
    }

    // GET: api/Booking/{id}
    [HttpGet("{id}")]
    public async Task<IActionResult> Get(int id)
    {
        var booking = await _context.Bookings
            .Include(b => b.User)
            .Include(b => b.Room)
            .Include(b => b.Customer)
            .FirstOrDefaultAsync(b => b.Id == id);

        if (booking == null)
            return NotFound("Booking not found.");

        var email = User.Identity!.Name;
        var role = User.FindFirst(ClaimTypes.Role)?.Value;

        if (role == "User")
        {
            var user = await _context.Users.FirstOrDefaultAsync(u => u.Email == email);
            if (user == null)
                return Unauthorized();
            if (booking.UserId != user.Id)
                return Forbid();
        }

        return Ok(booking);
    }

    // PUT: api/Booking/{id}/approve
    [Authorize(Roles = "Admin")]
    [HttpPut("{id}/approve")]
    public async Task<IActionResult> Approve(int id)
    {
        var booking = await _context.Bookings.FindAsync(id);
        if (booking == null)
            return NotFound("Booking not found.");

        if (booking.Status != BookingStatus.Pending)
            return BadRequest("Only pending bookings can be approved.");

        booking.Status = BookingStatus.Approved;
        await _context.SaveChangesAsync();
        return Ok(booking);
    }

    // PUT: api/Booking/{id}/reject
    [Authorize(Roles = "Admin")]
    [HttpPut("{id}/reject")]
    public async Task<IActionResult> Reject(int id)
    {
        var booking = await _context.Bookings.FindAsync(id);
        if (booking == null)
            return NotFound("Booking not found.");

        if (booking.Status != BookingStatus.Pending)
            return BadRequest("Only pending bookings can be rejected.");

        booking.Status = BookingStatus.Rejected;
        await _context.SaveChangesAsync();
        return Ok(booking);
    }

    // PUT: api/Booking/{id}
    [Authorize(Roles = "Admin,User")]
    [HttpPut("{id}")]
    public async Task<IActionResult> Update(int id, CreateBookingDto dto)
    {
        if (dto.EndTime <= dto.StartTime)
            return BadRequest("End time must be greater than start time.");

        var booking = await _context.Bookings.FindAsync(id);
        if (booking == null)
            return NotFound("Booking not found.");

        var email = User.FindFirst(ClaimTypes.Name)?.Value;
        var role = User.FindFirst(ClaimTypes.Role)?.Value;
        var user = await _context.Users.FirstOrDefaultAsync(u => u.Email == email);
        if (user == null)
            return Unauthorized();

        if (role == "User" && booking.UserId != user.Id)
            return Forbid();

        if (booking.Status != BookingStatus.Pending)
            return BadRequest("Only pending bookings can be edited.");

        // check room exists
        var room = await _context.Rooms.FindAsync(dto.RoomId);
        if (room == null)
            return BadRequest("Room not found.");

        // verify customer if provided
        if (dto.CustomerId.HasValue)
        {
            var cust = await _context.Customers
                .FirstOrDefaultAsync(c => c.Id == dto.CustomerId.Value && !c.IsDeleted);
            if (cust == null)
                return BadRequest("Customer not found.");
        }

        // conflict check excluding current booking
        bool isConflict = await _context.Bookings.AnyAsync(b =>
            b.Id != id &&
            b.RoomId == dto.RoomId &&
            b.Status == BookingStatus.Approved &&
            dto.StartTime < b.EndTime &&
            dto.EndTime > b.StartTime
        );
        if (isConflict)
            return BadRequest("Room already booked for this time range.");

        booking.RoomId = dto.RoomId;
        booking.StartTime = dto.StartTime;
        booking.EndTime = dto.EndTime;
        booking.Purpose = dto.Purpose;
        booking.CustomerId = dto.CustomerId;

        await _context.SaveChangesAsync();
        return Ok(booking);
    }

    // DELETE: api/Booking/{id}
    [Authorize(Roles = "Admin,User")]
    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(int id)
    {
        var booking = await _context.Bookings.FindAsync(id);
        if (booking == null)
            return NotFound("Booking not found.");

        var email = User.FindFirst(ClaimTypes.Name)?.Value;
        var role = User.FindFirst(ClaimTypes.Role)?.Value;
        var user = await _context.Users.FirstOrDefaultAsync(u => u.Email == email);
        if (user == null)
            return Unauthorized();

        if (role == "User" && booking.UserId != user.Id)
            return Forbid();

        if (booking.Status != BookingStatus.Pending && role != "Admin")
            return BadRequest("Only pending bookings can be deleted.");

        _context.Bookings.Remove(booking);
        await _context.SaveChangesAsync();
        return Ok("Booking deleted successfully.");
    }
}
