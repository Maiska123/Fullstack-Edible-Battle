
namespace ApiHelper;

using System.IO;
using System.Net;
using System.Net.Http;
using System.Net.Http.Headers;
using System.Threading.Tasks;
using System.Text.Json;
using System.Drawing;

using DeepAI; 

public class ImgProcessor 
{
    public async Task<MemoryStream> LoadAIGeneratedImg(string queryText = "questionmark")
    {

        DeepAI_API api = new DeepAI_API(apiKey: "quickstart-QUdJIGlzIGNvbWluZy4uLi4K");


        StandardApiResponse resp = api.callStandardApi("text2img", new {
                text = queryText,
        });
        


        Console.Write(api.objectAsJsonString(resp));

        if(api.objectAsJsonString(resp).Length > 1)
        {
            
            ImgModel? img = JsonSerializer.Deserialize<ImgModel>(api.objectAsJsonString(resp));

            return DownloadImageFromUrl(img.OutputUrl);
        }
        else
        {
            throw new Exception(api.ToString());
        }
        // using(HttpResponseMessage response = await ApiClientHelper.ApiClient.GetAsync(url))
        // {

        // }
    }

    // private async Task<Image>
    // public HttpResponseMessage Get(ImgModel url)
    // {
    //     // Image img = (Image)data.SingleOrDefault();
    //     // byte[] imgData = img.ImageData;

    //     // MemoryStream ms = new MemoryStream(imgData);
    //     // HttpResponseMessage response = new HttpResponseMessage(HttpStatusCode.OK);
    //     // response.Content = new StreamContent(ms);
    //     // response.Content.Headers.ContentType = new System.Net.Http.Headers.MediaTypeHeaderValue("image/png");

    //     return response;
    // }

    public MemoryStream DownloadImageFromUrl(string imageUrl = null)
    {
        Image image;

        if (imageUrl is null) return null;

        try
        {
            HttpWebRequest webRequest = (HttpWebRequest)HttpWebRequest.Create(imageUrl);
            webRequest.AllowWriteStreamBuffering = true;
            webRequest.Timeout = 40000;

            WebResponse webResponse = webRequest.GetResponse();

            Stream stream = webResponse.GetResponseStream();

            image = Image.FromStream(stream);

            webResponse.Close();
        }
        catch (Exception ex)
        {
            return null;
        }

        MemoryStream ms = new MemoryStream();
    
        image.Save(ms, System.Drawing.Imaging.ImageFormat.Png);
        return ms;
    

        //return image;
    }

}