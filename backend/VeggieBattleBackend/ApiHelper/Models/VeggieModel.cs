namespace ApiHelper;

public class VeggieModel
{
    private int UsageCount = 0;
    private int MaxUsage = 4;

    private byte[][] Veggies = new byte[4][];
    public string QueryName { get; set; }
    public string? Url { get; set; }
    public byte[] VeggieBytes { 
        get{
            if (UsageCount >= MaxUsage) return Veggies[0].ToArray();
            return Veggies[UsageCount].ToArray(); 
            } 
        set{ Veggies[UsageCount] = value; }   
    }

    public int UseVeggie { 
        get { 
                if (UsageCount >= MaxUsage) return -1;
                UsageCount++;
                return UsageCount; 
            } 
    }

    public VeggieModel(string queryName, string? url, byte[]? bytes){
        Console.WriteLine($"\nqueryName:\t{queryName}");
        Console.WriteLine($"url:\t{url}");
        Console.WriteLine($"bytes:\t{bytes}");
        QueryName = queryName;
        Url = url;
        VeggieBytes = bytes;
    }

}