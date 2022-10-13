using Microsoft.AspNetCore.Mvc;
using System.Drawing;

namespace ApiHelper.Controllers;
using ApiHelper.Services;

using ApiHelper;
[ApiController]
[Route("[controller]")]
public class VeggieImgController : ControllerBase
{

    private readonly ILogger<VeggieImgController> _logger;
    private readonly IVeggieCacheService _cacheService;
    private readonly IImgProcessorService _imgProcessor;

    public VeggieImgController(
        ILogger<VeggieImgController> logger,
        IVeggieCacheService service,
        IImgProcessorService imgProcessor)
    {
        _logger = logger;
        _cacheService = service;
        _imgProcessor = imgProcessor;
    }

    [Route("{veggieName}")]
    [HttpGet(Name = "GetVeggieImg")]
    public Task<System.IO.Stream> Get(string veggieName) // <StatModel>
    {
        if (_cacheService.veggieExists(veggieName)) {
            return _imgProcessor.getPreviousImg(veggieName);
        }
        _imgProcessor.newCounter(veggieName);

        // Store array of veggie names and give veggie and 1 from 4 available slots

        ApiClientHelper.InitializeClient();
        var img = _imgProcessor.LoadAIGeneratedImg(veggieName);

        return img;
    }

    [Route("utils/waiting/counter/{name}")]
    [HttpGet(Name = "GetVeggieImgWaitingCounterValue")]
    public OkObjectResult GetWaitingCounter(string name)
    {
        return Ok(_imgProcessor.getCountable(name));
    }

    [Route("utils/counter/{name}")]
    [HttpGet(Name = "GetVeggieImgCounterValue")]
    public OkObjectResult GetCounter(string name)
    {
        return Ok(_cacheService.getUsageCountByName(name));
    }

    [Route("utils/getall")]
    [HttpGet(Name = "GetAllVeggies")]
    public OkObjectResult GetVeggies()
    {
        return Ok(_cacheService.GetAllVeggiesAsString().Result);
    }
    
}



/*

// Text To Image - AI Art Generator Csharp Examples
// Ensure your DeepAI.Client NuGet package is up to date: https://www.nuget.org/packages/DeepAI.Client
// Example posting a text URL:

using DeepAI; // Add this line to the top of your file

DeepAI_API api = new DeepAI_API(apiKey: "quickstart-QUdJIGlzIGNvbWluZy4uLi4K");

StandardApiResponse resp = api.callStandardApi("text2img", new {
        text = "YOUR_TEXT_URL",
});
Console.Write(api.objectAsJsonString(resp));


// Example posting a local text file:

using DeepAI; // Add this line to the top of your file

DeepAI_API api = new DeepAI_API(apiKey: "quickstart-QUdJIGlzIGNvbWluZy4uLi4K");

StandardApiResponse resp = api.callStandardApi("text2img", new {
        text = File.OpenRead("C:\\path\\to\\your\\file.txt"),
});
Console.Write(api.objectAsJsonString(resp));


// Example directly sending a text string:

using DeepAI; // Add this line to the top of your file
*/
