using ApiHelper.Services;
using Microsoft.AspNetCore.Authentication.Certificate;
using Microsoft.Extensions.FileProviders;

var MyAllowSpecificOrigins = "_myAllowSpecificOrigins";

var builder = WebApplication.CreateBuilder (args);

            // builder.ConfigureWebHostOptions(builder =>
            // {
            //     builder.UseStartup<Startup>();
            //     builder.UseUrls("http://localhost:5000/");
            // });
            

// builder.Services.AddAuthentication(
//     CertificateAuthenticationDefaults.AuthenticationScheme)
//     .AddCertificate();

// builder.WebHost.ConfigureKestrel((context, serverOptions) =>
//             {
//                 serverOptions.Limits.KeepAliveTimeout = TimeSpan.FromMinutes(2);
//                 serverOptions.Limits.MaxConcurrentConnections = 10;
//                 serverOptions.Limits.MaxConcurrentUpgradedConnections = 10;
//                 serverOptions.Limits.MaxRequestBodySize = 100_000_000;
//                 serverOptions.Limits.RequestHeadersTimeout = TimeSpan.FromMinutes(1);
//                 serverOptions.Limits.Http2.MaxStreamsPerConnection = 100;
//                 serverOptions.Limits.Http2.HeaderTableSize = 4096;
//                 serverOptions.Limits.Http2.MaxFrameSize = 16_384;
//                 serverOptions.Limits.Http2.MaxRequestHeaderFieldSize = 8192;
//                 serverOptions.Limits.Http2.InitialConnectionWindowSize = 131_072;
//                 serverOptions.Limits.Http2.InitialStreamWindowSize = 98_304;

//                // serverOptions.Listen(System.Net.IPAddress.Loopback, 5003);
//                 serverOptions.Listen(System.Net.IPAddress.Loopback, 5000, listenOptions =>
//             {
//                 // listenOptions.UseHttps();
//               //listenOptions.UseHttps("testCert.pfx", "testPassword");
//             });
//         });

builder.Services.AddCors(options =>
{

    options.AddPolicy(name: MyAllowSpecificOrigins,
                      policy  =>
                      {
                          policy.WithOrigins("http://localhost:4200",
                                              "https://localhost:4200",
                                              "http://0.0.0.0:4200",
                                              "http://127.0.0.1:4200",
                                              "http://localhost:80",
                                              "https://localhost:80",
                                              "http://172.18.0.1",
                                              "https://172.18.0.1",
                                              "http://127.0.0.1:80",
                                              "http://localhost:443",
                                              "https://localhost:443",
                                              "http://0.0.0.0:443",
                                              "http://127.0.0.1:443",
                                              "https://veggiebattle.miskahannunkivi.fi",
                                              "http://veggiebattle.miskahannunkivi.fi")
                                                .AllowAnyHeader()
                                                .AllowAnyMethod()
                                                .AllowCredentials();
                      });
});

// Add services to the container.

builder.Services.AddControllers ();
// Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle
builder.Services.AddEndpointsApiExplorer ();
builder.Services.AddSwaggerGen ();

builder.Services.AddSingleton<IVeggieCacheService, VeggieCacheService> ();
builder.Services.AddSingleton<IImgProcessorService, ImgProcessorService> ();

var app = builder.Build ();



// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment ()) {
    app.UseSwagger ();
    app.UseSwaggerUI ();
}

app.UseAuthentication();
// app.UseHttpsRedirection ();
app.UseCors(MyAllowSpecificOrigins);
// app.UseStaticFiles();
// app.UseRouting();

var cacheMaxAgeOneWeek = (60 * 60 * 24 * 7).ToString();
app.UseStaticFiles(new StaticFileOptions
{
    OnPrepareResponse = ctx =>
    {
        ctx.Context.Response.Headers.Append(
             "Cache-Control", $"public, max-age={cacheMaxAgeOneWeek}");
    },
    FileProvider = new PhysicalFileProvider(
           Path.Combine(builder.Environment.ContentRootPath, "staticFiles")),
    RequestPath = "/StaticFiles"
});

app.UseAuthorization ();

app.MapControllers ();

app.MapGet("/", () => "Veggie Backend at your service!\n");

app.Run("http://0.0.0.0:5000");