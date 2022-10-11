namespace ApiHelper;

using System.Net.Http;
using System.Net.Http.Headers;
using System.Threading.Tasks;

public class StatProcessor 
{
    public async Task<StatModel> LoadStats()
    {
        string url = "https://fineli.fi/fineli/api/v1/foods/11060";

        using(HttpResponseMessage response = await ApiClientHelper.ApiClient.GetAsync(url))
        {
            if(response.IsSuccessStatusCode)
            {
                StatModel stat = await response.Content.ReadFromJsonAsync<StatModel>();

                return stat;
            }
            else
            {
                throw new Exception(response.ReasonPhrase);
            }
        }
    }
}