namespace ApiHelper;

using System.Net.Http;
using System.Net.Http.Headers;
using System.Threading.Tasks;
using DeepAI; 

public class ImgProcessor 
{
    public async Task<String> LoadAIGeneratedImg(string queryText = "questionmark")
    {

        DeepAI_API api = new DeepAI_API(apiKey: "quickstart-QUdJIGlzIGNvbWluZy4uLi4K");


        StandardApiResponse resp = api.callStandardApi("text2img", new {
                text = queryText,
        });
        

        Console.Write(api.objectAsJsonString(resp));

        if(api.objectAsJsonString(resp).Length > 1)
        {
            // StatModel stat = await response.Content.ReadFromJsonAsync<StatModel>();

            return api.objectAsJsonString(resp);
        }
        else
        {
            throw new Exception(api.ToString());
        }
        // using(HttpResponseMessage response = await ApiClientHelper.ApiClient.GetAsync(url))
        // {

        // }
    }
}