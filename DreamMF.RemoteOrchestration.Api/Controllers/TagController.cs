using DreamMF.RemoteOrchestration.Core.Models;
using DreamMF.RemoteOrchestration.Core.Services;
using Microsoft.AspNetCore.Mvc;

namespace DreamMF.RemoteOrchestration.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class TagController : ControllerBase
{
    private readonly TagService _tagService;

    public TagController(TagService tagService)
    {
        _tagService = tagService;
    }

    [HttpGet]
    public async Task<ActionResult<List<TagResponse>>> GetAllTags()
    {
        var tags = await _tagService.GetAllTagsAsync();
        return Ok(tags);
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<TagResponse>> GetTagById(int id)
    {
        var tag = await _tagService.GetTagByIdAsync(id);
        if (tag == null)
            return NotFound();
        return Ok(tag);
    }

    [HttpPost]
    public async Task<ActionResult<TagResponse>> CreateTag([FromBody] TagRequest request)
    {
        var tag = await _tagService.CreateTagAsync(request);
        return CreatedAtAction(nameof(GetTagById), new { id = tag.Tag_ID }, tag);
    }

    [HttpPut("{id}")]
    public async Task<ActionResult<TagResponse>> UpdateTag(int id, [FromBody] TagRequest request)
    {
        var tag = await _tagService.UpdateTagAsync(id, request);
        if (tag == null)
            return NotFound();
        return Ok(tag);
    }

    [HttpDelete("{id}")]
    public async Task<ActionResult> DeleteTag(int id)
    {
        await _tagService.DeleteTagAsync(id);
        return NoContent();
    }
}
