namespace ApiHelper.Controllers;

using Microsoft.AspNetCore.Mvc;

[ApiController]
[Route ("[controller]")]
public class VeggieStatsController : ControllerBase {

    private static readonly StatProcessor Stat = new StatProcessor ();

    private readonly ILogger<VeggieStatsController> _logger;

    public VeggieStatsController (ILogger<VeggieStatsController> logger) {
        _logger = logger;
    }

    [HttpGet ("GetVeggieStats")]
    public async Task<StatModel> Get () // <StatModel>
    {
        ApiClientHelper.InitializeClient ();
        var stats = await Stat.LoadStats ();
        return stats;
    }

    [HttpGet ("{veggieId}")]
    public async Task<WarriorStatModel> GetStatsById (int veggieId, [FromQuery]bool offline) // <StatModel>
    {
        ApiClientHelper.InitializeClient ();
        var stats = await Stat.LoadStatsById (veggieId, offline);
        return new WarriorStatModel (veggieId, stats.Name.ENG, stats);
    }

    [HttpGet ("createwarrior/random")]
    public async Task<WarriorStatModel> CreateWarriorStats ([FromQuery]bool offline) // <StatModel>
    {
        var id = new FinelliIdHelperModel ();

        ApiClientHelper.InitializeClient ();

        var stats = await Stat.LoadStatsById (id.Id, offline);

        while (stats is null) {
            id = new FinelliIdHelperModel ();
            stats = await Stat.LoadStatsById (id.Id, offline);
        }

        return new WarriorStatModel (id.Id, Stat.getRandomWarriorName ((stats.Name.ENG ?? stats.Name.FIN), Stat.getWarriorCharm (stats)), stats);
    }

}