using AdventureGraphQL.Api.Data;
using AdventureGraphQL.Api.Data.Entities;
using HotChocolate;
using HotChocolate.Data;
using Microsoft.EntityFrameworkCore;

public class Query
{
    /// <summary>
    /// Lista paginada de productos.
    /// </summary>
    [UsePaging(MaxPageSize = 50)]
    [UseProjection]
    [UseFiltering]
    [UseSorting]
    public IQueryable<Product> GetProducts(
        AdventureWorksContext context)
        => context.Products;

    /// <summary>
    /// Clientes con sus órdenes.
    /// </summary>
    [UsePaging]
    [UseProjection]
    [UseFiltering]
    [UseSorting]
    public IQueryable<Customer> GetCustomers(
        AdventureWorksContext context)
        => context.Customers;

    /// <summary>
    /// Un producto por su identificador.
    /// </summary>
    [UseProjection]
    public IQueryable<Product> GetProductById(
        int id,
        AdventureWorksContext context)
        => context.Products.Where(p => p.ProductID == id);
}

public record AddProductInput(
    string Name,
    string ProductNumber,
    decimal ListPrice,
    int? ProductSubcategoryId);

public record AddProductPayload(
    int ProductId,
    string Name,
    decimal ListPrice); 