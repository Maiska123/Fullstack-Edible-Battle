
namespace ApiHelper.Services;
// using ApiHelper.Services;

using System.IO;
using System.Net;
using System.Net.Http;
using System.Net.Http.Headers;
using System.Threading.Tasks;
using System.Text.Json;
using System.Drawing;

using DeepAI; 

public interface IImgProcessorService
{
    public CounterModel getCountable(string name);
    public void newCounter(string veggieName);
    public Task<System.IO.Stream> getPreviousImg(string veggieName);
    public Task<System.IO.Stream> LoadAIGeneratedImg(string queryText = "questionmark");
    public Task<System.IO.Stream> DownloadImageFromUrl(string imageUrl = null, string queryText = "questionmark");
}
public class ImgProcessorService : IImgProcessorService
{

    private readonly IVeggieCacheService _cacheService;
    public ImgProcessorService(IVeggieCacheService service)
    {
        _cacheService = service;
    }

    private int count = 0;

    public List<CounterModel> counters = new();

    public void newCounter(string veggieName){
        var boolFound = counters.Find(x => x.CounterName == veggieName);
        if (boolFound is null) counters.Add(new CounterModel(veggieName));
    }

    private void addToCounter(string veggieName){
        var boolFound = counters.Find(x => x.CounterName == veggieName);
        if (boolFound is not null) counters.Find(x => x.CounterName == veggieName).CounterValue++;
    }

    private void maxCounter(string veggieName){
        var boolFound = counters.Find(x => x.CounterName == veggieName);
        if (boolFound is not null) { counters.Find(x => x.CounterName == veggieName).CounterValue = boolFound.CounterMax; }
    }

    public CounterModel getCountable(string name){
        var returnable = counters.Find(x => x.CounterName == name);
        bool state = false;
        if (returnable is not null && returnable.CounterValue >= returnable.CounterMax) state = counters.Remove(returnable);
        return  state ? null : returnable;
    }

    public Task<System.IO.Stream> getPreviousImg(string veggieName){
        return _cacheService.GetVeggieStreamByName(veggieName);
    }
    public Task<System.IO.Stream> LoadAIGeneratedImg(string queryText = "questionmark")
    {
        _cacheService.InsertNewVeggieWithName(queryText);

        addToCounter(queryText);
        
        DeepAI_API api = new DeepAI_API(apiKey: "d4a5a1e5-cc46-46a9-a48d-aeda74784411");

        addToCounter(queryText);

        StandardApiResponse resp = api.callStandardApi("text2img", new {
                text = queryText,
        });

        addToCounter(queryText);

        // Console.Write(api.objectAsJsonString(resp));

        if(api.objectAsJsonString(resp).Length > 1)
        {
            
            ImgModel? img = JsonSerializer.Deserialize<ImgModel>(api.objectAsJsonString(resp));
            
            addToCounter(queryText);

            _cacheService.InsertVeggieUrlWithName(queryText, img.OutputUrl);

            return DownloadImageFromUrl(img.OutputUrl, queryText);
        }
        else
        {
            maxCounter(queryText);
            throw new Exception(api.ToString());
        }

    }


    public async Task<System.IO.Stream> DownloadImageFromUrl(string imageUrl = null, string queryText = "questionmark")
    {
        // Image image;

        if (imageUrl is null)  {
            
            maxCounter(queryText);
            return null;
        
        };

        var fileRetrievalClient = new HttpClient();    

        var fileResponse = await fileRetrievalClient.GetAsync(imageUrl);
        byte[] bytes = await fileResponse.Content.ReadAsByteArrayAsync();
        
        addToCounter(queryText);

        var content = new ByteArrayContent(bytes);
    
        content.Headers.ContentType = new MediaTypeHeaderValue("application/octet-stream");
        content.Headers.TryAddWithoutValidation("Content-Disposition", "application/octet-stream name=test");
        
        addToCounter(queryText);

        _cacheService.InsertVeggieBytesWithName(queryText, bytes);
        
        return content.ReadAsStream();

    }

}