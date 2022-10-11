using Microsoft.AspNetCore.Mvc;


namespace ApiHelper.Controllers;

[ApiController]
[Route("[controller]")]
public class VeggieImgController : ControllerBase
{

    private static readonly ImgProcessor Img = new ImgProcessor();

    private readonly ILogger<VeggieImgController> _logger;

    public VeggieImgController(ILogger<VeggieImgController> logger)
    {
        _logger = logger;
    }

    [HttpGet(Name = "GetVeggieImg")]
    public async Task<String> Get() // <StatModel>
    {
        ApiClientHelper.InitializeClient();
        var stats = await Img.LoadAIGeneratedImg("cartoon apple");

        return stats;
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
