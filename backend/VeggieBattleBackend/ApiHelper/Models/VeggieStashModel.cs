namespace ApiHelper;

public struct VeggieString {
    public string Name;
    public string Url;
    public VeggieString (string name, string url) {
        Name = name;
        Url = url;
    }
}

public class VeggieStashModel {
    public List<VeggieModel> Veggies = new ();


    public void addVeggieStatsbyName (WarriorStatModel incomingStats) {
         Veggies.Find (x => x.QueryName == incomingStats.Name).addStats(incomingStats);
    }

    public void AddVeggie (VeggieModel veggie) {
        if (Veggies is null) {
            Veggies = new ();
        }
        Veggies.Add (veggie);
    }

    public void AddVeggieWithName (string name) {
        if (Veggies is null) {
            Veggies = new ();
        }

        Veggies.Add (new VeggieModel (name, null, null));
    }

    public void AddVeggieUrlByName (string name, string url) {
        Veggies.Find (x => x.QueryName == name).Url = url;

    }

    public void AddVeggieBytesByName (string name, byte[] bytes) {
        Veggies.Find (x => x.QueryName == name).VeggieBytes = bytes;
    }

    private IEnumerator<VeggieModel> GetEnumerator () {
        foreach (VeggieModel veggie in Veggies) {
            yield return veggie;
        }
    }

    public byte[] VeggieBytesByName (string name) {
        return Veggies.Find (x => x.QueryName == name).VeggieBytes;
    }

    public VeggieModel GetVeggieByName (string name) {
        return Veggies.Find (x => x.QueryName == name);
    }

    public bool VeggieExists (string query) {

        if (Veggies.Count () > 0) {
            foreach (VeggieModel veggie in Veggies) {
                if (veggie.QueryName == query) return true;
            }
            return false;
        }
        return false;

    }

    public Task<string> GetAllVeggies () {
        string veggieString = $"[{{\"count\": {Veggies.Count()}}}";

        foreach (VeggieModel veggie in Veggies) {
            veggieString += $",{{\"Name\": \"{veggie.QueryName}\",\"Id\": \"{veggie?.Stats?.Id}\", \"url\": \"{veggie?.Url}\"}}";
        }
        veggieString += "]";
        return Task.FromResult (veggieString);
    }

}