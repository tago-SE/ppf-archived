using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Options;
using Microsoft.Graph;
using Microsoft.Graph.Models;
using Microsoft.Identity.Client;
using WebPortal.Server.Configuration;

namespace WebPortal.Server.Controllers
{
    
    public class GetGroupRequest
    {
        public string Email { get; set; }
        public string GroupId { get; set; }
    }

    [Route("api/[controller]")]
    [ApiController]
    public class UsersController(GraphServiceClient graphServiceClient, IOptions<AppOptions> applicationOptions) : ControllerBase
    {
        private readonly GraphServiceClient _graphServiceClient = graphServiceClient;
        private readonly AppOptions _applicationOptions = applicationOptions.Value;

        public static readonly string[] GroupIds = {
            "9b625c9e-a477-4ed9-8f67-3770c3e8320d", 
            "a52a2491-44c8-47d1-bc3f-e2e3b8990623", 
            "d9d84a3d-dd2d-4487-ab89-91c8400357c9" };

        public static readonly bool StopOnFirstMatch = false;

        [HttpGet("config")]
        public IActionResult GetConfig()
        {
            return Ok(_applicationOptions);
        }

        [HttpPost("email")]
        public async Task<IActionResult> GetUserByEmail([FromBody] string email)
        {
            if (string.IsNullOrEmpty(email))
            {
                return BadRequest("Email is required.");
            }
            try
            {
                var user = await _graphServiceClient.Users[email].GetAsync();
                var userById = await _graphServiceClient.Users[user?.Id].TransitiveMemberOf.GetAsync();
                return Ok(userById);
            }
            catch (ServiceException ex)
            {
                return StatusCode(500, ex.Message);
            }
        }

        [HttpPost("group/email")]
        public async Task<IActionResult> GetGroupByEmail([FromBody] GetGroupRequest body)
        {
            if (string.IsNullOrEmpty(body.Email))
            {
                return BadRequest("Email is required.");
            }
            try
            {
                var user = await _graphServiceClient.Users[body.Email].GetAsync();
                var userId = user!.Id;
                List<Group> result = [];
                var directoryObjectCollection = await _graphServiceClient.Users[userId].TransitiveMemberOf.GetAsync();
                if (directoryObjectCollection is null)
                {
                    return Ok(result);
                }
                await PageIterator<DirectoryObject, DirectoryObjectCollectionResponse>
                    .CreatePageIterator(_graphServiceClient, directoryObjectCollection, (directoryObject) =>
                    {
                        if (directoryObject is Group group && GroupIds.Contains(group.Id))
                        {
                            result.Add(group);
                            if (StopOnFirstMatch) return false; // Stop 
                        }
                        return true; // Continue
                    })
                    .IterateAsync();
                return Ok(result);
            }
            catch (ServiceException ex)
            {
                return StatusCode(500, ex.Message);
            }
        }

    }
}
