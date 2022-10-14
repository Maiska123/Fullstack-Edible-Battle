namespace ApiHelper;

public class WarriorStatModel {
        /*
        100 grammaa sisältää:

        Energia (kcal) = Health Points eli kestopisteet.
        Hiilihydraatit (g) = Hyökkäysvoima
        Proteiinit (g) = Puolustusvoima (voidaan käyttää esim. prosentuaalisesti, koska maksimi on tietty 100)
        Rasvat ei erikseen lisää mitään statsia, mutta enemmän rasvaa = enemmän energiaa = enemmän helaa
        Hiilihydraattien, rasvojen ja proteiinien yhteenlaskettu grammamäärä = Hitaus. (tai käänteisellä arvolla hyökkäysnopeus)
        */

        public string Name { get; set; }

        public int Id { get; set; }

        public double Hp { get; set; }

        public double Attack { get; set; }

        public double Defence { get; set; }

        public double Speed { get; set; }

        public double Luck { get; set; }

        public WarriorStatModel (int id, string name, StatModel Parameters) {
                Name = name;
                Id = id;
                Hp = Parameters.EnergyKcal;
                Attack = Parameters.Carbohydrate;
                Defence = Parameters.Protein;
                Speed = (Parameters.Carbohydrate + Parameters.Protein + Parameters.Fat);
                Luck = Parameters.SaturatedFat;
        }
        /*
                carbohydrate: 8.3100004196167,
                alcohol: 0,
                sugarAlcohol: 0,
                protein: 0.189999997615814,
                energy: 169.577499389648,
                ediblePortion: 100,
                fiber: 1.79999995231628,
                organicAcids: 0.540000021457672,
                salt: 2.33999991416931,
                saturatedFat: 0.0214000009000301,
                sugar: 8.21000003814697,
                fat: 0.100000001490116,
                energyKcal: 40.51256614975584
        */

}