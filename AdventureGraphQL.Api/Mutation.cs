using AdventureGraphQL.Api.Data;
using AdventureGraphQL.Api.Data.Entities;
using HotChocolate.Subscriptions;

public class Mutation
{
    public async Task<AddProductPayload> AddProductAsync(
        AddProductInput input,
        AdventureWorksContext context,
        ITopicEventSender sender,
        CancellationToken ct)
    {
        if (input.ListPrice < 0)
        {
            throw new Exception("El precio no puede ser negativo.");
        }

        var product = new Product
        {
            Name = input.Name,
            ProductNumber = input.ProductNumber,

            // Valores requeridos por AdventureWorks
            MakeFlag = true,
            FinishedGoodsFlag = true,

            SafetyStockLevel = 1000,
            ReorderPoint = 750,

            StandardCost = 1m,
            ListPrice = input.ListPrice,

            DaysToManufacture = 0,

            SellStartDate = DateTime.UtcNow,
            ModifiedDate = DateTime.UtcNow,

            rowguid = Guid.NewGuid()
        };

        context.Products.Add(product);

        await context.SaveChangesAsync(ct);

        var payload = new AddProductPayload(
            product.ProductID,
            product.Name,
            product.ListPrice);

        await sender.SendAsync(
            nameof(Subscription.OnProductAdded),
            payload,
            ct);

        return payload;
    }

    public async Task<Product> UpdatePriceAsync(
        int id,
        decimal newPrice,
        AdventureWorksContext context,
        CancellationToken ct)
    {
        var product = await context.Products.FindAsync(
            new object[] { id },
            ct);

        if (product is null)
        {
            throw new Exception($"No existe el producto con id {id}");
        }

        product.ListPrice = newPrice;

        await context.SaveChangesAsync(ct);

        return product;
    }
}