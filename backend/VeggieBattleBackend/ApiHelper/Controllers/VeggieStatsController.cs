using Microsoft.AspNetCore.Mvc;

namespace ApiHelper.Controllers;

[ApiController]
[Route("[controller]")]
public class VeggieStatsController : ControllerBase
{

    private static readonly StatProcessor Stat = new StatProcessor();

    private readonly ILogger<VeggieStatsController> _logger;

    public VeggieStatsController(ILogger<VeggieStatsController> logger)
    {
        _logger = logger;
    }

    [HttpGet(Name = "GetVeggieStats")]
    public async Task<StatModel> Get() // <StatModel>
    {
        ApiClientHelper.InitializeClient();
        var stats = await Stat.LoadStats();
        return stats;
    }
    
}
