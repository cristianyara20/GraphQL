using AdventureGraphQL.Api.Data;
using Microsoft.EntityFrameworkCore;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend",
        builder => builder
            .WithOrigins("http://localhost:5173")
            .AllowAnyHeader()
            .AllowAnyMethod());
});

builder.Services.AddPooledDbContextFactory<AdventureWorksContext>(opt =>
    opt.UseSqlServer(
        builder.Configuration.GetConnectionString("AdventureWorks")));

builder.Services
    .AddGraphQLServer()
    .AddQueryType<Query>()
    .AddMutationType<Mutation>()
    .AddSubscriptionType<Subscription>()
    .AddInMemorySubscriptions()
    .RegisterDbContextFactory<AdventureWorksContext>()
    .AddProjections()
    .AddFiltering()
    .AddSorting();

var app = builder.Build();

app.UseCors("AllowFrontend");
app.UseWebSockets();   // <- IMPORTANTE

app.MapGraphQL();

app.Run();