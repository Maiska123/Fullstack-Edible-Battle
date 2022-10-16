using ApiHelper.Services;
using Microsoft.AspNetCore.Authentication.Certificate;
using Microsoft.Extensions.FileProviders;

var  MyAllowSpecificOrigins = "_myAllowSpecificOrigins";

var builder = WebApplication.CreateBuilder (args);

builder.Services.AddAuthentication(
    CertificateAuthenticationDefaults.AuthenticationScheme)
    .AddCertificate();

builder.Services.AddCors(options =>
{
    
    options.AddPolicy(name: MyAllowSpecificOrigins,
                      policy  =>
                      {
                          policy.WithOrigins("http://localhost:4200",
                                              "https://localhost:4200")
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
app.UseHttpsRedirection ();
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

app.Run ();