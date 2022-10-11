namespace ApiHelper;

using System.Text.Json.Serialization;

public class ImgModel
{
        [JsonPropertyName("job_id")]
        public int JobId { get; set; }

        [JsonPropertyName("output")]
        public object Output { get; set; }

        [JsonPropertyName("output_url")]
        public string OutputUrl { get; set; }

}