using Microsoft.AspNetCore.Mvc;

namespace WebPortal.Server.Controllers;

[Route("api/[controller]")]
[ApiController]
public class TestController : Controller
{

    private readonly IHttpClientFactory _httpClientFactory;

    public TestController(IHttpClientFactory httpClientFactory)
    {
        _httpClientFactory = httpClientFactory;
    }

    [HttpGet("ping")]
    public IActionResult Ping()
    {
        return Ok("pong");
    }

    [HttpGet("whatsmyip")]
    public async Task<IActionResult> WhatsMyIp()
    {
        var client = _httpClientFactory.CreateClient();

        HttpResponseMessage response = await client.GetAsync("https://api.ipify.org?format=json");
        if (response.IsSuccessStatusCode)
        {
            string ip = await response.Content.ReadAsStringAsync();
            return Ok(ip);
        }
        else
        {
            return StatusCode((int)response.StatusCode, response.ReasonPhrase);
        }
    }

    [HttpGet("webshopwidget")]
    public async Task<IActionResult> FetchWidget()
    {
        var client = _httpClientFactory.CreateClient();

        HttpResponseMessage response = await client.GetAsync("https://branded-ds-widget-sec-dev.azurewebsites.net/widgetset/agencywidgets/dev/dD9gQVYN9MysmAmcHuyra5SM");
        if (response.IsSuccessStatusCode)
        {
            string result = await response.Content.ReadAsStringAsync();
            return Ok(result);
        }
        else
        {
            return StatusCode((int)response.StatusCode, response.ReasonPhrase);
        }
    }
}
