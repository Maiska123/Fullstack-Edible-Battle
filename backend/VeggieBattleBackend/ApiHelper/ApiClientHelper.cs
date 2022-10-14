﻿namespace ApiHelper;

using System.Net.Http;
using System.Net.Http.Headers;

public static class ApiClientHelper {
    public static HttpClient ApiClient { get; set; }

    public static void InitializeClient () {
        ApiClient = new HttpClient ();
        ApiClient.DefaultRequestHeaders.Accept.Clear ();
        ApiClient.DefaultRequestHeaders.Accept.Add (new MediaTypeWithQualityHeaderValue ("application/json"));
    }
}