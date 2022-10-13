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

    [Route("{veggieId}")]
    [HttpGet(Name = "GetVeggieStatsById")]
    public async Task<WarriorStatModel> GetStatsById(int veggieId) // <StatModel>
    {
        ApiClientHelper.InitializeClient();
        var stats = await Stat.LoadStatsById(veggieId);
        return new WarriorStatModel(veggieId, stats);
    }

    [Route("createwarrior/random")]
    [HttpGet(Name = "CreateWarriorStatsForVeggie")]
    public async Task<WarriorStatModel> CreateWarriorStats() // <StatModel>
    {
        Random random = new Random();
        var id = random.Next(1,4000);

        ApiClientHelper.InitializeClient();
        var stats = await Stat.LoadStatsById(id);
        
        return new WarriorStatModel(id, stats);
    }
    
}
