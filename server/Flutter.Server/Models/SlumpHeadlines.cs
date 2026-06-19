namespace Flutter.Server.Models;

/// <summary>
/// Funny headline pool for Slump events. {0} is replaced with company name.
/// </summary>
public static class SlumpHeadlines
{
    private static readonly string[] Pool =
    [
        "{0} CEO arrested live on breakfast TV",
        "{0} factory burns down. \"It was the toaster\" says janitor",
        "{0} board caught playing Monopoly during AGM",
        "Devastating: {0} accidentally emails P45s to everyone",
        "{0} share price in freefall after intern deletes the database",
        "{0} HQ sinks into the ground — built on old mine",
        "Oil tanker full of {0} profits runs aground",
        "{0} product found to be \"mostly cardboard\"",
        "Scandal! {0} CFO's cat has been signing the accounts",
        "{0} entire R&D budget spent on executive hot tub",
        "Health inspector shuts down {0} canteen — again",
        "{0} marketing campaign backfires spectacularly",
        "Lightning strikes {0} server room — no backups",
        "{0} investors flee after CEO's podcast rant goes viral",
        "Rats! Literal rats take over {0} headquarters",
    ];

    public static string GetHeadline(string companyName)
    {
        var template = Pool[Random.Shared.Next(Pool.Length)];
        return template.Replace("{0}", companyName);
    }
}
