using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Options;
using WebPortal.Server.Configuration;

namespace WebPortal.Server.Controllers
{
    [ApiController]
    [Route("[controller]")]
    public class WeatherForecastController : ControllerBase
    {

        private readonly RedisOptions _redisOptions;

        private static readonly string[] Summaries = new[]
        {
            "Freezing", "Bracing", "Chilly", "Cool", "Mild", "Warm", "Balmy", "Hot", "Sweltering", "Scorching"
        };

        private readonly ILogger<WeatherForecastController> _logger;

        public WeatherForecastController(ILogger<WeatherForecastController> logger, IOptions<RedisOptions> options)
        {
            _logger = logger;
            _redisOptions = options.Value;

        }

        [HttpGet("ping")]
        public IEnumerable<WeatherForecast> GetWeather()
        {
            return Enumerable.Range(1, 5).Select(index => new WeatherForecast
            {
                Date = DateOnly.FromDateTime(DateTime.Now.AddDays(index)),
                TemperatureC = Random.Shared.Next(-20, 55),
                Summary = Summaries[Random.Shared.Next(Summaries.Length)]
            })
            .ToArray();
        }

        [HttpGet("config")]
        public IActionResult GetConfig()
        {
            return Ok(_redisOptions);
        }
    }
}
