namespace ApiHelper.Controllers;

using ApiHelper;
using ApiHelper.Services;
using Microsoft.AspNetCore.Mvc;
using System.Drawing.Imaging;
using System.Drawing;
using System.Net.Mime;
[ApiController]
[Route ("[controller]")]
public class VeggieImgController : ControllerBase {

    private readonly ILogger<VeggieImgController> _logger;
    private readonly IVeggieCacheService _cacheService;
    private readonly IImgProcessorService _imgProcessor;

    public VeggieImgController (
        ILogger<VeggieImgController> logger,
        IVeggieCacheService service,
        IImgProcessorService imgProcessor) {
        _logger = logger;
        _cacheService = service;
        _imgProcessor = imgProcessor;
    }

    [HttpGet ("{veggieName}")]
    [Produces(System.Net.Mime.MediaTypeNames.Image.Jpeg)]
    public IActionResult GetVeggieImg (string veggieName)
    {
        
        if (_cacheService.veggieExists (veggieName)) {
            if ((_imgProcessor.getPreviousImg (veggieName) is not null))
            {
                return File((_imgProcessor.getPreviousImg (veggieName)).Result, MediaTypeNames.Image.Jpeg, $"{veggieName}.jpeg");
            }
            return NotFound();
        }
        Console.WriteLine("Started Creating a new Veggie");
        _imgProcessor.newCounter (veggieName);

        // Store array of veggie names and give veggie and 1 from 4 available slots

        ApiClientHelper.InitializeClient ();
        var img = _imgProcessor.LoadAIGeneratedImg (veggieName);

        // MemoryStream ms = new MemoryStream(img.Result);
        // Image i = Image.FromStream(ms);
        
        // return Ok(i);
        return File(img.Result, MediaTypeNames.Image.Jpeg, $"{veggieName}.jpeg");
    }

    [HttpGet ("utils/waiting/counter/{name}")]
    public IActionResult GetWaitingCounter (string name) {
        var counter = _imgProcessor.getCountable (name);
        return counter is not null ? Ok (counter) : NotFound();
    }

    [HttpGet ("utils/counter/{name}")]
    public OkObjectResult GetCounter (string name) {
        return Ok (_cacheService.getUsageCountByName (name));
    }

    [HttpGet ("utils/getall")]
    public OkObjectResult GetVeggies () {
        return Ok (_cacheService.GetAllVeggiesAsString ().Result);
    }

}