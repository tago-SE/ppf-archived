# Luanchpad Documentation Site

This site is built using [MkDocs]. It serves as a temporary setup until we decide if a more advanced solution is needed.

## Getting Started

### Creating pages

To create new pages, simply add markdown files to the [docs folder] in the repository. MkDocs will convert these files into static HTML pages when you build or deploy the site.

The [mkdocs.yml] file contains various pre-configured settings to make documentation creation easier. Refer to the comments and provided links within the file for more details.

## Build and start

To build the pages locally, follow these steps:

### Build

1. Ensure you are in the directory containing the mkdocs.yml file.
2. Install Python 3.7 or later.
3. Run `pip install -r requirements.txt`.
4. Install MkDocs and all required dependencies, including Material for MkDocs.

After these steps run the `mkdocs build`command. MkDocs will generate the HTML files in the configured output directory.

### Start

You should now be able to run `mkdocs serve`.

## Deploy

Deployment is currently handled through a static web app pipeline defined in [static-webapp-pipeline.yml]. You can edit content in the [docs folder] and trigger a redeployment as needed.

## FAQ

> **Can I alter the overall style of the pages?**

Yes. Material for MkDocs supports Theme extensions, meaning you can override specific parts of a theme by providing the particular file in a folder and defining this folder as the `custom_dir` one in the [mkdocs.yml].  
This template ships with a `theme` folder that can be used for that and you can just uncomment the aforementioned line in the YAML file.

## References

- The documentation site is based on this original template: https://github.com/Andre601/mkdocs-template. 
- [MkDocs]
- [MkDocs Material Theme]
- [Original Template]

[Original Template]: https://github.com/Andre601/mkdocs-template/generate
[MkDocs]: https://www.mkdocs.org/
[MkDocs Material Theme]: https://github.com/squidfunk/mkdocs-material

[mkdocs.yml]: https://dev.azure.com/if-it/Partner%20Portal%20Framework/_git/if-ppf-launchpad?path=/apps/docs/mkdocs.yml
[docs folder]: https://dev.azure.com/if-it/Partner%20Portal%20Framework/_git/if-ppf-launchpad?path=/apps/docs/docs
[static-webapp-pipeline.yml]: https://dev.azure.com/if-it/Partner%20Portal%20Framework/_git/if-ppf-launchpad?path=/apps/docs/static-webapp-pipeline.yml