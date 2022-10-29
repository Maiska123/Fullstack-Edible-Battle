namespace ApiHelper;

using System.Net.Http;
using System.Threading.Tasks;
using System.IO;
using Polly;
using Polly.Extensions.Http;
using Polly.CircuitBreaker;


public enum StatKeyWord {
    /*
    hp: 534.198257787,
    attack: .649999976158142,
    defence: .899999976158142,
    speed: 61.549999952316284,
    luck: 17.552516784668
    */
    HP = 0,
    ATTACK = 1,
    DEFENCE = 2,
    SPEED = 3,
    LUCK = 4,
    FINALBOSS = 5
}
public class StatProcessor 
{
    private readonly AsyncCircuitBreakerPolicy<HttpResponseMessage> _circuitBreaker =
    Policy<HttpResponseMessage>
        .Handle<HttpRequestException>()
        .OrTransientHttpError()
        .AdvancedCircuitBreakerAsync(0.5, TimeSpan.FromSeconds(10),10,TimeSpan.FromSeconds(15));


    public async Task<StatModel> LoadStats () {
        string url = "https://fineli.fi/fineli/api/v1/foods/1";
        using (HttpResponseMessage response = await ApiClientHelper.ApiClient.GetAsync (url)) {
            if (response.IsSuccessStatusCode) {
                StatModel stat = await response.Content.ReadFromJsonAsync<StatModel> ();
                return stat;
            } else {
                throw new Exception (response.ReasonPhrase);
            }
        }
    }
   
    public async Task<string> LoadInspiration () {
        string url = "https://api.kanye.rest/text";
        using (HttpResponseMessage response = await ApiClientHelper.ApiClient.GetAsync (url)) {
            if (response.IsSuccessStatusCode) {
                string quote = await response.Content.ReadFromJsonAsync<string> ();
                return (quote is not null ? quote : "no luck today");
            } else {
                throw new Exception (response.ReasonPhrase);
            }
        }
    }
    
    public async Task<StatModel> LoadStatsById (int id, bool offline = false) {
        string url = $"https://fineli.fi/fineli/api/v1/foods/{id}";

        if ((_circuitBreaker.CircuitState is CircuitState.Open or CircuitState.Isolated)
        || offline)
        {
            return backupMethodFromFile();
        }
        try {
            HttpResponseMessage response = await _circuitBreaker.ExecuteAsync(() =>
                ApiClientHelper.ApiClient.GetAsync (url));

            if (response.IsSuccessStatusCode) {
                StatModel stat = await response.Content.ReadFromJsonAsync<StatModel> ();
                return stat;
            } else {
                return backupMethodFromFile();

                throw new Exception(response.ReasonPhrase);
            }
            
        } catch (Exception ex) {
            return backupMethodFromFile();

            throw ex;
        }
    }
    public StatModel backupMethodFromFile (bool offline = false) {
        Console.WriteLine( offline ?
                "\nChanged to Backupmethod: using offline storage\n"
            :   "\nChanged to Backupmethod: used API for Stats possible down\n"
            );
        
        String allStaticVeggies = (File.ReadAllText(Path.Combine(System.AppDomain.CurrentDomain.BaseDirectory, "staticFiles/veggiestats.json")));
        StatModel[] veggies = System.Text.Json.JsonSerializer.Deserialize<StatModel[]>(allStaticVeggies); 
        Random random = new();
        var newId = random.Next (0, veggies.Count());
        return veggies.ElementAt(newId);
    }


    public string getRandomWarriorName (string ingredient, StatKeyWord? extra) {

        string warriorName = "";

        Random random = new Random ();

        string[] BASEadjectives = "fired trashy tubular nasty jacked swol buff ferocious firey flamin agnostic artificial bloody crazy cringey crusty dirty eccentric glutinous harry juicy simple stylish awesome creepy corny freaky shady sketchy lame sloppy hot intrepid juxtaposed killer ludicrous mangy pastey ragin rusty rockin sinful shameful stupid sterile ugly vascular wild young old zealous flamboyant super sly shifty trippy fried injured depressed anxious clinical".Split (' ');
        string[] HPadjectives = { "bigwig", "heavyweight", "honcho", "kingpin", "biggie", "heavy", "kahuna", "kingfish", "nabob", "nawab", "nob", "big", "bigfoot", "nibs", "wheel", "big shot", "big-timer", "big leaguer", "big wheel", "heavy hitter", "big cheese", "big gun", "fat cat", "major leaguer", "high-muck-a-muck", "high-muckety-muck", "muck-a-muck", "muckety-muck", "poo-bah", "pooh-bah", "VIP", "big kahuna", "dignitary", "notable", "head honcho", "key player", "celebrity", "top dog", "big enchilada", "important person", "influential person", "leader", "muckety muck", "somebody", "big fish", "personage", "mogul", "major player", "top banana", "grand poobah", "grandee", "powerful person", "notability", "heavy-hitter", "magnate", "star", "leading light", "powerful batter", "great gun", "big cat", "big man on campus", "muckamuck", "big name", "big noise", "aristo", "toff", "high man on the totem pole", "fat-cat", "large monster", "yeti", "sasquatch", "deputy", "plutocrat", "viceroy", "governor", "boss", "chief", "person in charge", "character", "lion", "person of influence", "eminence", "top cat", "official", "titan", "luminary", "bigshot", "colossus", "hotshot", "joss", "big bug", "brass hat", "Big Daddy", "panjandrum", "Big Chief", "superstar", "ace", "number one", "principal", "linchpin", "name", "celeb", "personality", "figure", "megastar", "worthy", "public figure", "icon", "standout", "light", "ikon", "notoriety", "macher", "household name", "celebutante", "cause celebre", "someone", "king", "famous name", "high muckamuck", "V.I.P.", "tycoon", "high muckety-muck", "famous person", "pillar of society", "top brass", "master", "supremo", "lord", "face", "big hitter", "great", "guru", "giant", "legend", "person of note", "very important person", "idol", "baron", "prodigy", "industrialist", "monarch", "captain", "prince", "entrepreneur", "tsar", "Napoleon", "czar", "big chief", "lady muck", "expert", "hero", "lord muck", "high-up", "top name", "guiding light", "bashaw", "executive", "proprietor", "mandarin", "authority", "royalty", "magnifico", "potentate", "power", "captain of industry", "Mr Big", "director", "inspiration", "Lord Muck", "Lady Muck", "Mister Big", "top executive", "man", "sun", "juggernaut", "distinguished person", "brass ring", "big deal", "important personage", "face idol", "main comic", "second to none", "big Daddy", "person", "administrator", "wonder", "dynast", "princess", "queen", "headliner", "muckymuck", "well-known person", "robber baron", "hotdog", "dignity", "draw", "sphere", "pillar of the community", "favoriteUS", "favouriteUK", "big-time operator", "starlet", "success", "topliner", "eminent person", "fundi", "pillar of the church", "pillar of the state", "achiever", "top gun", "numero uno", "boss man", "federal case", "major concern", "matter of life and death", "serious issue", "phenomenon", "doyen", "pundit", "virtuoso", "pro", "elite", "specialist", "doyenne", "hot shot", "maestro", "scholar", "genius", "savant", "champion", "sage", "maven", "whiz", "manager", "big boss", "wizard", "old pro", "top hand", "connoisseur", "big wig", "capitalist", "immortal", "cynosure", "financier", "businessperson", "merchant", "noble", "prelate", "aristocrat", "peer", "big stuff", "the cheese", "merchant prince" };
        string[] ATTACKadjectives = { "forceful", "violent", "strong", "vigorous", "almighty", "hard", "mighty", "ferocious", "explosive", "fierce", "crushing", "brutal", "devastating", "forcible", "heavy", "thunderous", "great", "overpowering", "blistering", "destructive", "overwhelming", "potent", "dynamic", "mightful", "annihilating", "calamitous", "damaging", "desolating", "tremendous", "strengthful", "strengthy", "rugged", "severe", "grievous", "robust", "intense", "puissant", "beastly", "hard-hitting", "all-powerful", "really hard", "very hard", "powerhouse", "hefty", "significant", "heavy-duty", "dominant", "influential", "energetic", "important", "gutsy", "punchy", "commanding", "sharp", "acute", "telling", "authoritative", "extreme", "redoubtable", "formidable", "active", "smart", "titanic", "weighty", "knockout", "high-powered", "aggressive", "driving", "vehement", "of considerable importance", "considerable", "predominant", "imposing", "drastic", "virulent", "stark", "turbulent", "vicious", "savage", "not to be ignored", "controlling", "indomitable", "fearsome", "omnipotent", "elemental", "to be reckoned with", "high", "boss", "sturdy", "a hard nut to crack", "spanking", "trenchant" };
        string[] DEFENCEadjectives = { "protecting", "safeguarding", "shielding", "preservative", "defensive", "covering", "defending", "guarding", "safety", "insulating", "conservative", "toughened", "fireproof", "waterproof", "armoredUS", "armouredUK", "heatproof", "shatterproof", "sheltering", "conservational", "custodial", "emergency", "guardian", "self-protective", "conserving", "stabilizingUS", "preserving", "antibacterial", "antifungal", "stabilisingUK", "opposing", "reinforced", "screening", "withstanding", "fortified", "bulletproof", "saving", "conservatory", "precautionary", "preventive", "preventative", "safekeeping", "supervisory", "sheltered" };
        string[] SPEEDadjectives = { "quick", "rapid", "accelerated", "brisk", "express", "nimble", "swift", "breakneck", "fleet", "high-speed", "speedy", "blistering", "expeditious", "expeditive", "fast-moving", "fleet-footed", "hasty", "sprightly", "up-tempo", "hypersonic", "lightning", "meteoric", "nippy", "snappy", "supersonic", "velocious", "zippy", "flat-out", "mercurial", "rapid-fire", "rattling", "turbo", "spanking", "ultrafast", "ultrarapid", "volant", "winged", "flying", "whirlwind", "galloping", "dizzy", "hot", "splitting", "breathless", "hurried", "prompt", "instant", "sudden", "lively", "immediate", "alacritous", "precipitate", "abrupt", "headlong", "instantaneous", "rathe", "timely", "active", "rushed", "precipitous", "harefooted", "spirited", "overnight", "fast-track", "cursory", "energetic", "vigorous", "ready", "fleeting", "cracking", "at speed", "speeding", "split-second", "smart", "agile", "quickie", "fleet of foot", "sharp", "direct", "brief", "spry", "quick-fire", "whistle-stop", "very fast", "rash", "on-the-spot", "ultrasonic", "hurrying", "zooming", "short", "dashing", "moving", "hurtling", "animated", "unexpected", "violent", "unforeseen", "drive-by", "vivacious", "unanticipated", "pacey", "punctual", "precipitant", "perfunctory", "passing", "light-footed", "willing", "summary", "superficial", "overhasty", "straightaway", "unhesitating", "gadarene", "without warning", "double time", "double-quick", "PDQ", "responsive", "helter-skelter", "pell-mell", "haphazard", "without delay", "fast-tracked", "staccato", "tantivy", "barreling", "blinding", "scorching", "streaming", "with good acceleration", "dizzying", "non-stop", "fast-paced", "furious", "impulsive", "lightning-quick", "lightning fast", "barrelling", "prevenient", "quickened", "crash", "anticipatory", "sporty", "rush", "machine-gun", "extremely fast", "dangerously fast", "like crazy", "urgent", "at full tilt", "like mad", "sped up", "quick as a wink", "hurry-up", "spontaneous", "dynamic", "fast and furious", "momentary", "transitory", "promptly given", "early", "short-lived", "the double", "surprising", "hair-trigger", "now or never", "not to be delayed", "on the spot", "like lightning", "tearing", "whizzing", "sailing", "hastening", "whisking", "rushing", "running", "darting", "in a flash", "careless", "tripping", "deft", "like the wind", "desultory", "swift as an arrow", "quick-moving", "bustling", "incidental", "irresponsible", "slapdash", "casual", "unfussy", "hit-or-miss", "purposeless", "racing", "exciting", "frenetic", "upbeat", "twinkle-toed", "light of foot" };
        string[] LUCKadjectives = { "fortuitous", "auspicious", "fortunate", "opportune", "providential", "timely", "felicitous", "propitious", "serendipitous", "charmed", "convenient", "expedient", "happy", "advantageous", "apt", "blessed", "golden", "promising", "beneficial", "benign", "favoredUS", "favouredUK", "hopeful", "hot", "heaven-sent", "favourableUK", "favorableUS", "good", "encouraging", "profitable", "bright", "well-timed", "prosperous", "fitting", "seasonable", "suitable", "welcome", "useful", "fair", "helpful", "well timed", "full of promise", "right", "beneficent", "friendly", "benefic", "benignant", "salutary", "appropriate", "rosy", "optimistic", "likely", "fit", "fluky", "flukey", "kindly", "nice", "ripe", "pleasing", "handy", "heartening", "conducive", "satisfactory", "toward", "privileged", "reassuring", "upbeat", "roseate", "of benefit", "rose-colored", "pleasant", "constructive", "ideal", "benevolent", "merciful", "pat", "gratifying", "worthy", "wholesome", "healthful", "pleasureful", "flattering", "cheering", "pleasurable", "jammy", "desirable", "gainful", "behooveful", "furthersome", "thankful", "successful", "healthy", "well-off", "halcyon", "well disposed", "at the right time", "select", "excellent", "clement", "warm", "enviable", "up-and-coming", "smiling", "dexter", "palmy", "positive", "likely-looking", "assuring", "perfect", "lucky-dog", "valuable", "becoming", "proper", "rewarding", "fruitful", "lucrative", "befitting", "fitted", "seemly", "reasonable", "applicable", "done", "due", "strategic", "worthwhile", "rightful", "requisite", "adequate", "sufficient", "comely", "suited", "best", "of assistance", "in one's interests", "of value", "to advantage", "for the best", "of use", "of service", "comme il faut", "productive", "effective", "practical", "serviceable", "advisable", "effectual", "wise", "sensible", "instrumental", "efficacious", "prudent", "win-win", "of help", "sound", "efficient", "recommended", "judicious", "operative", "remunerative", "moneymaking", "politic", "practicable", "invaluable", "meritorious", "usable", "functional", "economic", "worth it", "pragmatic", "paying", "valid", "acceptable", "tactical", "nifty", "potent", "commodious", "suggested", "necessary", "powerful", "fat", "juicy", "money-spinning", "going", "capable", "significant", "workable", "preferable", "utile", "agreeable", "logical", "commonsensical", "supportive", "thriving", "contributive", "informative", "sagacious", "facilitative", "utilizableUS", "needed", "utilitarian", "substantial", "uplifting", "consumable", "strong", "good for you", "formative", "profit-making", "available", "exploitable", "to one's advantage", "enriching", "utilisableUK", "viable", "employable", "financially rewarding", "well-paid", "satisfying", "subservient", "provident", "meet", "fulfilling", "illuminating", "important", "rational", "decent", "recommendable", "flourishing", "meaningful", "gladdening", "essential", "well", "working", "lush", "relevant", "estimable", "inspiring", "contributory", "rich", "booming", "comfortable", "bankable", "sweet", "well-paying", "in one's best interests", "well spent", "useable", "exciting", "operational", "functioning", "virtuous", "accessible", "competent", "industrious", "generative", "applied", "ultrapractical", "operable", "applicative", "actionable", "central", "running", "current", "telling", "forcible", "in the black", "feasible", "decisive", "determinative", "expendable", "unused", "wieldy", "exhaustible", "adaptable", "open", "ready", "in working order", "at one's disposal", "at hand", "in order", "availing", "healing", "edifying", "shrewd", "astute", "greatly appreciated", "congruous", "gentle", "conformable", "ample", "canny", "correct", "preferred", "of great help", "accommodating", "heartwarming", "comforting", "set", "disposed", "reasoned", "desired", "plus", "circumspect", "farsighted", "in one's favour", "in one's favor", "on one's side", "commercial", "crying out", "neat", "in one's interest", "instructive", "well-spent", "recompensing", "a good idea", "for-profit", "renumerative", "required", "tasteful", "disposable", "pivotal", "vital", "crucial", "paid", "adjuvant", "forceful", "enough", "indicated", "commendable", "generous", "fructuous", "paramount", "indispensable", "imperative", "critical", "definitive", "best suited", "presentable", "clear", "self-serving", "financially worthwhile", "well-suited", "to one's own advantage", "in one's own interests", "in running order", "up and running", "at your disposal", "operating", "ready for use", "available for use", "fit for use", "cheerful", "versatile", "multipurpose", "in demand", "appreciated", "fundamental", "key", "respected", "admired", "exigent", "born with a silver spoon in your mouth", "unique", "superb", "going concern", "paid off", "very productive", "compelling", "assisting", "saving", "enlivening", "inspiriting", "called for", "called-for", "brilliant", "special", "fine", "splendid", "tremendous", "loved", "esteemed" };

        switch (extra) {
            case StatKeyWord.HP:
                warriorName += HPadjectives[random.Next (0, HPadjectives.Count ())];
                break;
            case StatKeyWord.ATTACK:
                warriorName += ATTACKadjectives[random.Next (0, ATTACKadjectives.Count ())];
                break;
            case StatKeyWord.DEFENCE:
                warriorName += DEFENCEadjectives[random.Next (0, DEFENCEadjectives.Count ())];
                break;
            case StatKeyWord.SPEED:
                warriorName += SPEEDadjectives[random.Next (0, SPEEDadjectives.Count ())];
                break;
            case StatKeyWord.LUCK:
                warriorName += LUCKadjectives[random.Next (0, LUCKadjectives.Count ())];
                break;
            case StatKeyWord.FINALBOSS:
                warriorName += "You Are Dead To Me";
                break;
            default:
                warriorName += BASEadjectives[random.Next (0, BASEadjectives.Count ())];
                break;
        }

        warriorName += $" {ingredient}";

        return warriorName;
    }

    public StatKeyWord? getWarriorCharm (StatModel stats) {

        if (stats.EnergyKcal > 250.00 &&
            stats.Carbohydrate > 50.00 &&
            stats.Protein > 50.00 &&
            (stats.Carbohydrate + stats.Protein + stats.Fat) > 100.00 &&
            stats.SaturatedFat > 50.00
        ) return StatKeyWord.FINALBOSS;
        if (stats.EnergyKcal > 200.00) return StatKeyWord.HP;
        if (stats.Carbohydrate > 50.00) return StatKeyWord.ATTACK;
        if (stats.Protein > 50.00) return StatKeyWord.DEFENCE;
        if ((stats.Carbohydrate + stats.Protein + stats.Fat) > 70.00) return StatKeyWord.SPEED;
        if (stats.SaturatedFat > 50.00) return StatKeyWord.LUCK;

        return null;
    }
}