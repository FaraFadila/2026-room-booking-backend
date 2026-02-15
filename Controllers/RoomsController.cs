using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Authorization;
using Data;
using Models;

namespace Controllers;

[ApiController]
[Route("api/[controller]")]
public class RoomsController : ControllerBase
{
    private readonly AppDbContext _context;

    public RoomsController(AppDbContext context)
    {
        _context = context;
    }

    // GET ALL
    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        return Ok(await _context.Rooms.ToListAsync());
    }

    // ================= GET BY ID =================
    [HttpGet("{id}")]
    public async Task<IActionResult> GetById(int id)
    {
        var room = await _context.Rooms.FindAsync(id);
        if (room == null)
            return NotFound();

        return Ok(room);
    }

    // ================= UPDATE =================
    [Authorize(Roles = "Admin")]
    [HttpPut("{id}")]
    public async Task<IActionResult> Update(int id, Room dto)
    {
        var room = await _context.Rooms.FindAsync(id);
        if (room == null)
            return NotFound();

        room.Name = dto.Name;
        room.Capacity = dto.Capacity;
        room.Location = dto.Location;
        room.IsAvailable = dto.IsAvailable;

        await _context.SaveChangesAsync();
        return Ok(room);
    }

    // ================= DELETE =================
    [Authorize(Roles = "Admin")]
    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(int id)
    {
        var room = await _context.Rooms.FindAsync(id);
        if (room == null)
            return NotFound();

        _context.Rooms.Remove(room);
        await _context.SaveChangesAsync();
        return Ok("Room deleted successfully.");
    }

    // CREATE ROOM (ADMIN ONLY)
    // role names are case-sensitive; use "Admin" not "admin".
    [Authorize(Roles = "Admin")]  // only administrators may add rooms
    [HttpPost]
    public async Task<IActionResult> Create(Room room)
    {
        _context.Rooms.Add(room);
        await _context.SaveChangesAsync();

        return Ok(room);
    }
}
