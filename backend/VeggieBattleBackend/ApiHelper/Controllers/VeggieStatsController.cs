namespace ApiHelper.Controllers;

using Microsoft.AspNetCore.Mvc;
using ApiHelper.Services;

[ApiController]
[Route ("[controller]")]
public class VeggieStatsController : ControllerBase {

    private static readonly StatProcessor Stat = new StatProcessor ();

    private readonly ILogger<VeggieStatsController> _logger;
    private readonly IVeggieCacheService _cacheService;

    public VeggieStatsController (
        ILogger<VeggieStatsController> logger,
        IVeggieCacheService service) {
        _logger = logger;
        _cacheService = service;
    }

    [HttpGet ("GetVeggieStats")]
    public async Task<StatModel> Get () // <StatModel>
    {
        ApiClientHelper.InitializeClient ();
        var stats = await Stat.LoadStats ();
        return stats;
    }

    [HttpGet ("getInspiration")]
    public async Task<IActionResult> GetInspiration () // <StatModel>
    {
        ApiClientHelper.InitializeClient ();
        var inspiration = await Stat.LoadInspiration ();
        return Ok(inspiration);
    }

    [HttpGet ("{veggieId}")]
    public async Task<WarriorStatModel> GetStatsById (int veggieId, [FromQuery]bool offline) // <StatModel>
    {
        ApiClientHelper.InitializeClient ();
        var stats = await Stat.LoadStatsById (veggieId, offline);
        return new WarriorStatModel (veggieId, stats.Name.ENG, stats);
    }

    [HttpPost ("{veggieId}")]
    public async Task<IActionResult> CacheVeggieStats (int veggieId, WarriorStatModel stats) // <StatModel>
    {
        _cacheService.InsertVeggieStatsWithId(veggieId,stats);
        return Ok(veggieId);
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