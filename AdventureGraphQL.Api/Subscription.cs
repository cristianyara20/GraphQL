using HotChocolate;
using HotChocolate.Subscriptions;

public class Subscription
{
    [Subscribe]
    [Topic]
    public AddProductPayload OnProductAdded(
        [EventMessage] AddProductPayload product)
        => product;
}