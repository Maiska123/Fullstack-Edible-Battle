
namespace ApiHelper;

using System.Text.Json.Serialization;

public class FoodName {

    [JsonPropertyName ("en")]
    public string ENG { get; set; }

    [JsonPropertyName ("fi")]
    public string FIN { get; set; }

    }

public class StatModel {


    [JsonPropertyName ("id")]
    public int Id { get; set; }

    [JsonPropertyName ("unit")]
    public string Unit { get; set; }

    [JsonPropertyName ("amount")]
    public double Amount { get; set; }

    [JsonPropertyName ("carbohydrate")]
    public double Carbohydrate { get; set; }

    [JsonPropertyName ("alcohol")]
    public double Alcohol { get; set; }

    [JsonPropertyName ("sugarAlcohol")]
    public double SugarAlcohol { get; set; }

    [JsonPropertyName ("protein")]
    public double Protein { get; set; }

    [JsonPropertyName ("energy")]
    public double Energy { get; set; }

    [JsonPropertyName ("ediblePortion")]
    public int EdiblePortion { get; set; }

    [JsonPropertyName ("fiber")]
    public double Fiber { get; set; }

    [JsonPropertyName ("organicAcids")]
    public double OrganicAcids { get; set; }

    [JsonPropertyName ("salt")]
    public double Salt { get; set; }

    [JsonPropertyName ("saturatedFat")]
    public double SaturatedFat { get; set; }

    [JsonPropertyName ("sugar")]
    public double Sugar { get; set; }

    [JsonPropertyName ("fat")]
    public double Fat { get; set; }

    [JsonPropertyName ("energyKcal")]
    public double EnergyKcal { get; set; }

    [JsonPropertyName ("name")]
    public FoodName Name { get; set; }


}