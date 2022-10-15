namespace ApiHelper.Services;

public interface IVeggieCacheService {
    public Task<string> GetAllVeggiesAsString ();
    public int getUsageCountByName (string name);
    public bool veggieExists (string name);
    public Task<byte[]> GetVeggieStreamByName (string veggieName);
    public void InsertNewVeggie (VeggieModel veggie);
    public void InsertNewVeggieWithName (string name);

    public void InsertVeggieUrlWithName (string name, string url);

    public void InsertVeggieBytesWithName (string name, byte[] bytes);
}
public class VeggieCacheService : IVeggieCacheService {
    public static VeggieCacheService? singletonInstance;
    private static readonly object _lock = new object ();
    public VeggieCacheService () { }
    public static VeggieCacheService GetInstance () {
        if (singletonInstance == null) {
            lock (_lock) {
                if (singletonInstance == null)
                    singletonInstance = new VeggieCacheService ();
            }
        }
        return singletonInstance;
    }

    private static VeggieStashModel VeggieCache = new ();

    public Task<byte[]> GetVeggieStreamByName (string veggieName) {
        return Task.FromResult(VeggieCache.VeggieBytesByName (veggieName));
    }

    public bool veggieExists (string name) {
        return VeggieCache.VeggieExists (name);
    }

    public int getUsageCountByName (string name) {
        if (VeggieCache.VeggieExists (name)) return VeggieCache.GetVeggieByName (name).UseVeggie;
        return -1;
    }

    public Task<string> GetAllVeggiesAsString () {
        if (VeggieCache is not null) {
            return VeggieCache.GetAllVeggies ();
        } else { return Task.FromResult ("no data!"); }
    }

    public void InsertNewVeggieWithName (string name) {
        if (VeggieCache is null) {
            VeggieCache = new ();
            VeggieCache.AddVeggieWithName (name);

        } else {
            VeggieCache.AddVeggieWithName (name);
        }
        Console.WriteLine ($"\nNew Veggie created with a cool name of \"{name}\"!\n");
    }

    public void InsertNewVeggie (VeggieModel veggie) {
        if (VeggieCache is null) {
            VeggieCache = new ();
            VeggieCache.AddVeggie (veggie);

        } else {
            VeggieCache.AddVeggie (veggie);
        }
    }

    public void InsertVeggieUrlWithName (string name, string url) {
        VeggieCache.AddVeggieUrlByName (name, url);
    }

    public void InsertVeggieBytesWithName (string name, byte[] bytes) {
        VeggieCache.AddVeggieBytesByName (name, bytes);
    }

}