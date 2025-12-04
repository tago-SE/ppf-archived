
# Golden Path as a Product (POC)

The core concept for GPaaP consists of 3 areas for the purposes of this POC:

1) Templates
2) Infrastructure
3) Discoverability/Documentation

Note: There are other aspects that may be important to look into but to setup the basic idea these are the ingredients that we have at hand.

## 1. Templates

Move what was made from Dealerservices into the templates folder and make it easily deployable. For the POC we will start with 3 templates:

* dotnet portal
* dotnet widget
* next.js empty app (we could otherwise use the original ppf-starter-template or the one Kaizen is working on)

Q: What framework to use to create and publish templates?

For the POC we are just using dotnet but perhaps there are better frameworks who facilitate publishing and managing changes.

<https://learn.microsoft.com/en-us/dotnet/core/tutorials/cli-templates-create-project-template>

How to handle versioning?

How to release changes, manage versioning and test them before release?

Q: What are similar ways of doing it which we haven't looked into? Perhaps typescript have better CLI than the ones currently used?

## 2. Infrastucture

For PPF we decided to use Azure Container Apps and have setup processes to automate the creation of infrastructure for other teams, for this POC we would be reusing these capabilities. But something to consider is to move the infrastructure as code inside the templates, so that teams can go their own way and have greater ability to modify the infrastructure?

Scope:

1. Make the templates compatible with existing infrastructure deployment
2. Teams should have an easy time replicating the necessary appsettings to get started on their deployed infrastructure.

## 3. Disocverability

Using AZ DevOps API we can connect to the markdown files inside a repository and based on this scrape all the documentatiton relevant to a certain template.

Scope:

1. Create a small next.js to show case how this could look, ideally if we move from POC to MVP we could see how to integrate it into the Developer Portal by creating a PageTemplate which allows users to point to Azure DevOps repository locations.

## References

* <https://engineering.atspotify.com/2020/08/how-we-use-golden-paths-to-solve-fragmentation-in-our-software-ecosystem/>

* <https://www.redhat.com/en/blog/designing-golden-paths>
