namespace ApiHelper;

public class CounterModel
{
        public string CounterName { get; set; }

        public int CounterValue { get; set; }

        public int CounterMax { get; set; }

        public string? Message { get; set; }

        public CounterModel(string name, int value, int limit, string? message){
            CounterName = name;
            CounterValue = value;
            CounterMax = limit;
            if (message is not null) Message = message;
        }

        public CounterModel(string name){
            CounterName = name;
            CounterValue = 0;
            CounterMax = 6;
        }

}