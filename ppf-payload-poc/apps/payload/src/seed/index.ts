import { EntraGroupAuthN, Tenant } from "@/payload-types";
import { CollectionSlug, GlobalSlug, getPayload } from "payload";
import { locales } from "@/locales";
import { createHome } from "./home";
import config from "./../payload.config";
import { createChild } from "./child";
import { createTenant, TenantSeedData, updateTenantWithLinks } from "./tenant";
import { createPost } from "./post";
import { createCategory } from "./category";
import { createMedia } from "./media";
import { loadMediaFile } from "./utils";
import { createPage } from "./page";
import {
  COLLECTION_SLUG_DYANMIC_PAGE,
  COLLECTION_SLUG_REUSABLE_BLOCKS,
} from "@/collections/config";
import { TenantAuthenticationPrincipalType } from "@/collections/Tenants/fields/authentication/authenticationOptions";
import { TenantAuthentication } from "@/collections/Tenants/service/getTenantPermissions";
import { updateReferenceTrack } from "@/collections/hooks/updateRefs";
import { getCurrentDeployedEnvironmentThrows } from "@/lib/utils/getCurrentDeployedEnv";

const collections: CollectionSlug[] = [
  "media",
  "categories",
  "tenants",
  "pages",
  "reusable-blocks",
  //'session',
  //'user'
];

const environment = getCurrentDeployedEnvironmentThrows();

const globals: GlobalSlug[] = [];

const localeDefaults = {
  defaultLocale: "en",
  siteLocales: locales.map((locale) => locale.code),
} as Pick<Tenant, "siteLocales" | "defaultLocale">;

const systemFlowCurityClientAuth: TenantAuthentication = {
  principalType: TenantAuthenticationPrincipalType.CurityClient,
  [TenantAuthenticationPrincipalType.CurityClient]: {
    clientId: "f2160702-c592-4127-83c6-bec0af147ebe",
    aud: "f2160702-c592-4127-83c6-bec0af147ebe",
    scopes: ["partner.portal.content"],
    env: "authtest",
    iss: "https://authtest.if.eu/~",
  },
};

const ppf_portal_pldnet_dev_ca_id: TenantAuthentication = {
  principalType: TenantAuthenticationPrincipalType.ServicePrincipal,
  [TenantAuthenticationPrincipalType.ServicePrincipal]: {
    clientId: "76117b8c-ec09-4ab3-8b13-f3a669c5b89b",
    objectId: "d6ef5cc0-ea6a-46cb-a751-9f5be8733a74",
    tid: "de7e7a67-ae61-49d2-97a7-526c910ad675",
  },
};

const ppf_portal_pldnet_test_ca_id: TenantAuthentication = {
  principalType: TenantAuthenticationPrincipalType.ServicePrincipal,
  [TenantAuthenticationPrincipalType.ServicePrincipal]: {
    clientId: "e73e8bdd-9b88-4689-8a43-3ab6f84751fe",
    objectId: "09605b5b-717c-4c82-96b4-be5ab335d328",
    tid: "de7e7a67-ae61-49d2-97a7-526c910ad675",
  },
};

const ppf_portal_plnext_dev_ca_id = {
  principalType: TenantAuthenticationPrincipalType.ServicePrincipal,
  [TenantAuthenticationPrincipalType.ServicePrincipal]: {
    clientId: "442ef179-2e20-4b44-9503-7466f8f1bd28",
    objectId: "e1b93e86-7106-424c-ad61-64acb15c13b7",
    tid: "de7e7a67-ae61-49d2-97a7-526c910ad675",
  },
};

const ppf_portal_plnext_test_ca_id = {
  principalType: TenantAuthenticationPrincipalType.ServicePrincipal,
  [TenantAuthenticationPrincipalType.ServicePrincipal]: {
    clientId: "648faa6c-63b9-463a-87ec-08c075930393",
    objectId: "3f89119d-8b59-4510-a9c1-49fa23041501",
    tid: "de7e7a67-ae61-49d2-97a7-526c910ad675",
  },
};

const groups = {
  GA_AISPPAT_PayloadCMS_Login_Test: {
    name: "GA_AISPPAT_PayloadCMS_Login_Test",
    objectId: "f03da62c-3e6c-4c88-bc70-f6c080627fb6",
  },
  GA_AISPPAT_PayloadCMS_Tenant2_Test: {
    name: "GA_AISPPAT_PayloadCMS_Tenant2_Test",
    objectId: "b397eacf-637b-4838-9f79-41bea97da5c4",
  },
  GA_AISPPAT_PayloadCMS_Tenant1_Test: {
    name: "GA_AISPPAT_PayloadCMS_Tenant1_Test",
    objectId: "e1285229-ce1a-4de6-9f95-8aa23f212d31",
  },
  SdsOp_API_Events_Read: {
    name: "SdsOp_API--Events_Read",
    objectId: "3271d299-d4b9-4520-84b1-27a05fc880cb",
  },
};

const createGroupAuthenticator = (group: EntraGroupAuthN) => {
  const value = {
    principalType: TenantAuthenticationPrincipalType.Group,
    [TenantAuthenticationPrincipalType.Group]: group,
  };
  return value;
};

type TenantEnvironmentConfig = Pick<Tenant, "security" | "siteUrl">;

type TenantEnvironmensConfig = {
  dev: TenantEnvironmentConfig;
  test: TenantEnvironmentConfig;
  prod: TenantEnvironmentConfig;
};

const tenant_1: TenantEnvironmensConfig = {
  dev: {
    siteUrl: "https://portal-pldnet-ppf-if-eu.portal.dev.ppf.ifext.biz",
    security: {
      authentication: [
        ppf_portal_pldnet_dev_ca_id,
        createGroupAuthenticator(groups.GA_AISPPAT_PayloadCMS_Tenant1_Test),
      ],
      editorGroups: [groups.GA_AISPPAT_PayloadCMS_Tenant1_Test],
    },
  },
  test: {
    siteUrl: "https://portal-pldnet-ppf-if-eu.portal.test.ppf.ifext.biz",
    security: {
      authentication: [
        ppf_portal_pldnet_test_ca_id,
        createGroupAuthenticator(groups.GA_AISPPAT_PayloadCMS_Tenant1_Test),
      ],
      editorGroups: [groups.GA_AISPPAT_PayloadCMS_Tenant1_Test],
    },
  },
  prod: {
    siteUrl: "",
    security: {
      authentication: [],
      editorGroups: [],
    },
  },
};

const tenant_2: TenantEnvironmensConfig = {
  dev: {
    siteUrl: "https://portal-plnext-ppf-if-eu.portal.dev.ppf.ifext.biz",
    security: {
      authentication: [
        ppf_portal_plnext_dev_ca_id,
        createGroupAuthenticator(groups.GA_AISPPAT_PayloadCMS_Tenant2_Test),
        systemFlowCurityClientAuth,
      ],
      editorGroups: [groups.GA_AISPPAT_PayloadCMS_Tenant2_Test],
    },
  },
  test: {
    siteUrl: "https://portal-plnext-ppf-if-eu.portal.test.ppf.ifext.biz",
    security: {
      authentication: [
        ppf_portal_plnext_test_ca_id,
        createGroupAuthenticator(groups.GA_AISPPAT_PayloadCMS_Login_Test),
        systemFlowCurityClientAuth,
      ],
      editorGroups: [groups.GA_AISPPAT_PayloadCMS_Login_Test],
    },
  },
  prod: {
    siteUrl: "",
    security: {
      authentication: [],
      editorGroups: [],
    },
  },
};

const tenant_3: TenantEnvironmensConfig = {
  dev: {
    siteUrl: "",
    security: {
      authentication: [createGroupAuthenticator(groups.SdsOp_API_Events_Read)],
      editorGroups: [groups.SdsOp_API_Events_Read],
    },
  },
  test: {
    siteUrl: "",
    security: {
      authentication: [createGroupAuthenticator(groups.SdsOp_API_Events_Read)],
      editorGroups: [groups.SdsOp_API_Events_Read],
    },
  },
  prod: {
    siteUrl: "",
    security: {
      authentication: [],
      editorGroups: [],
    },
  },
};

const tennants = [
  {
    tenant: {
      name: "Tenant 1",
      slug: "tenant-1",
      ...localeDefaults,
      ...tenant_1[environment],
    } as TenantSeedData,
  },
  {
    tenant: {
      name: "Tenant 2",
      slug: "tenant-2",
      ...localeDefaults,
      ...tenant_2[environment],
    } as TenantSeedData,
  },
  {
    tenant: {
      name: "Tenant 3",
      slug: "tenant-3",
      ...localeDefaults,
      ...tenant_3[environment],
    } as TenantSeedData,
  },
];

const seed = async (): Promise<void> => {
  const payload = await getPayload({ config });
  payload.logger.info("Seeding database...");
  payload.logger.info(`- Clearing collections and globals...`);

  // clear globals
  await Promise.all(
    globals.map((global) =>
      payload.updateGlobal({
        slug: global,
        data: {
          //navItems: [],
        },
        depth: 0,
        context: {
          disableRevalidate: true,
        },
      })
    )
  );

  // clear collections
  for (const collection of collections) {
    payload.logger.info("Deleting collection " + collection);
    await payload.db.deleteMany({ collection, where: {} });
  }

  await Promise.all(
    tennants.map(async (data) => {
      const tenantSlug = data.tenant.slug;
      payload.logger.info(`- (${tenantSlug}) Seeding tenant...`);

      const tenant = await createTenant(payload, {
        ...data.tenant,
      });

      payload.logger.info(`- (${tenantSlug}) Reusable blocks...`);
      const reusableBlock = await payload.create({
        collection: COLLECTION_SLUG_REUSABLE_BLOCKS,
        data: {
          tenant: tenant.id,
          title: "Reusable Code Block",
          content: [
            {
              blockType: "code",
              language: "typescript",
              code: `// This is shared block, you can edit me in "Reusable Blocks" collection\n\nconsole.log("Hello world")`,
            },
          ],
        },
      });

      payload.logger.info(`- (${tenantSlug}) Media...`);
      const image1 = await createMedia(payload, {
        tenantId: tenant.id,
        mediaSource: "imageshop",
        externalUrl: "https://v.imgi.no/fpbk5e7cpj",
        externalThumbnailURL:
          "https://magik.imageshop.no/iMageWithFallbackAndMagikAndS3.aspx?d=1&t=638782272000000000&c=image%2fjpeg&base=224&h=C040D953C74AC97E4EB899F78170D0FE&x=0&y=0&real=&img=b9715f8d-ab70-4348-85bb-e14aca79a987-v-4.jpg",
      });

      const image2 = await createMedia(payload, {
        tenantId: tenant.id,
        mediaSource: "imageshop",
        externalUrl: "https://v.imgi.no/lthaxx4rqu",
        externalThumbnailURL:
          "https://magik.imageshop.no/iMageWithFallbackAndMagikAndS3.aspx?d=1&t=638782272000000000&c=image%2fjpeg&base=224&h=EF5415342A9F514841F69E0A4CE93BF1&x=0&y=0&real=&img=e850f67e-aa2f-49af-9a61-73c5b5af73a6-wm.jpg",
      });

      const image3 = await createMedia(payload, {
        tenantId: tenant.id,
        mediaSource: "imageshop",
        externalUrl: "https://v.imgi.no/sarcebh2xz",
        externalThumbnailURL:
          "https://magik.imageshop.no/iMageWithFallbackAndMagikAndS3.aspx?d=1&t=638782272000000000&c=image%2fjpeg&base=224&h=195998B458148CB2234C01FEC8D9961C&x=0&y=0&real=&img=3b05742d-529c-4664-866d-51393249a350-wm.jpg",
      });

      const pdfFile = await createMedia(payload, {
        tenantId: tenant.id,
        mediaSource: "upload",
        file: await loadMediaFile(
          "dummy.pdf",
          `dummy_${crypto.randomUUID()}.pdf`,
          "application/pdf"
        ),
      });

      const image4 = await createMedia(payload, {
        tenantId: tenant.id,
        mediaSource: "upload",
        file: await loadMediaFile(
          "sample_image.jpeg",
          `sample_image_${crypto.randomUUID()}.jpeg`,
          "image/jpeg"
        ),
        alt: "akita inu",
        caption: {
          root: {
            type: "root",
            format: "",
            indent: 0,
            version: 1,
            direction: "ltr",
            children: [
              {
                type: "paragraph",
                format: "",
                ident: 0,
                version: 1,
                direction: "lrt",
                textStyle: "",
                textFormet: 0,
                children: [
                  {
                    mode: "normal",
                    text: "This image is uploaded to blob storage, while all other images are sourced from ",
                    type: "text",
                    style: "",
                    detail: 0,
                    format: 0,
                    version: 1,
                  },
                  {
                    mode: "normal",
                    text: "Imageshop",
                    type: "text",
                    style: "",
                    detail: 0,
                    format: 1,
                    version: 1,
                  },
                  {
                    mode: "normal",
                    text: ". Using the media block, you can add a rich text description, which will be rendered alongside the ",
                    type: "text",
                    style: "",
                    detail: 0,
                    format: 0,
                    version: 1,
                  },
                  {
                    mode: "normal",
                    text: "image or video",
                    type: "text",
                    style: "",
                    detail: 0,
                    format: 2,
                    version: 1,
                  },
                  {
                    mode: "normal",
                    text: ".",
                    type: "text",
                    style: "",
                    detail: 0,
                    format: 0,
                    version: 1,
                  },
                ],
              },
            ],
          },
        },
      });

      const video = await createMedia(payload, {
        tenantId: tenant.id,
        mediaSource: "upload",
        file: await loadMediaFile(
          "sample_video.mp4",
          `sample_video_${crypto.randomUUID()}.mp4`,
          "video/mp4"
        ),
      });

      payload.logger.info(`- (${tenantSlug}) Home page...`);
      const homePage = await createHome(payload, {
        tenantId: tenant.id,
        tenantName: tenant.name,
        media: [image1.id, image2.id, image3.id],
        pdf: pdfFile.id,
        video: video.id,
        uploadImg: image4.id,
        reusableBlocks: [reusableBlock.id],
      });

      payload.logger.info(`- (${tenantSlug}) Child page...`);
      const childPage = await createChild(payload, {
        tenantId: tenant.id,
        parentId: homePage.id,
        slug: "child-page",
        title: "Child Page",
        header: "About this Page",
        text: "Above, you can see a hero block with a medium impact level",
        hero: {
          type: "mediumImpact",
          title: "Child Page",
          text: "This page is a direct child of the Home page, designed to test nested document structures and breadcrumb navigation.",
          media: image1.id,
        },
      });

      payload.logger.info(`- (${tenantSlug}) Grand child page...`);
      const grandChildPage = await createChild(payload, {
        tenantId: tenant.id,
        parentId: childPage.id,
        slug: "grand-child-page",
        title: "Grand Child Page",
        header: "About this Page",
        text: "Above, you can see a hero block with a high impact level",
        hero: {
          type: "highImpact",
          title: "Grand Child Page",
          text: "This page is a child of another child page, making it a grandchild of the Home page. It serves to test nested documents and breadcrumb navigation functionality.",
          media: image2.id,
        },
      });

      payload.logger.info(`- (${tenantSlug}) Seeding categories`);

      const category1 = await createCategory(payload, {
        tenantId: tenant.id,
        title: "Tutorials",
      });

      const category2 = await createCategory(payload, {
        tenantId: tenant.id,
        title: "Article",
      });

      payload.logger.info(`- (${tenantSlug}) Seeding posts`);

      const post1 = await createPost(payload, {
        tenantId: tenant.id,
        slug: "post-1",
        title: "Why PayloadCMS?",
        meta: {
          title: "Why PayloadCMS? | Payload Website Template",
          description:
            "Dive into the marvels of modern innovation, where the only constant is change. A journey where pixels and data converge to craft the future.",
        },
        categories: [category1.id, category2.id],
      });

      const post2 = await createPost(payload, {
        tenantId: tenant.id,
        slug: "post-2",
        title: "Getting Started",
        meta: {
          title: "Getting Started | Payload Website Template",
          description:
            "Dive into the marvels of modern innovation, where the only constant is change. A journey where pixels and data converge to craft the future.",
        },
        categories: [category1.id],
        layout: [
          {
            customBlocks: [
              {
                blockType: "content",
                columns: [
                  {
                    size: "full",
                    richText: {
                      root: {
                        type: "root",
                        children: [
                          {
                            type: "heading",
                            children: [
                              {
                                type: "text",
                                detail: 0,
                                format: 0,
                                mode: "normal",
                                style: "",
                                text: "Sample post about setting up PayloadCMS",
                                version: 1,
                              },
                            ],
                            direction: "ltr",
                            format: "",
                            indent: 0,
                            tag: "h2",
                            version: 1,
                          },
                          {
                            type: "block",
                            fields: {
                              blockName: "Disclaimer",
                              blockType: "banner",
                              content: {
                                root: {
                                  type: "root",
                                  children: [
                                    {
                                      type: "paragraph",
                                      children: [
                                        {
                                          type: "text",
                                          detail: 0,
                                          format: 1,
                                          mode: "normal",
                                          style: "",
                                          text: "Disclaimer:",
                                          version: 1,
                                        },
                                        {
                                          type: "text",
                                          detail: 0,
                                          format: 0,
                                          mode: "normal",
                                          style: "",
                                          text: " This is not real tutorial!",
                                          version: 1,
                                        },
                                      ],
                                      direction: "ltr",
                                      format: "",
                                      indent: 0,
                                      textFormat: 0,
                                      version: 1,
                                    },
                                  ],
                                  direction: "ltr",
                                  format: "",
                                  indent: 0,
                                  version: 1,
                                },
                              },
                              style: "info",
                            },
                            format: "",
                            version: 2,
                          },
                          {
                            type: "paragraph",
                            children: [
                              {
                                type: "text",
                                detail: 0,
                                format: 0,
                                mode: "normal",
                                style: "",
                                text: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. In pretium libero augue, eu dictum orci faucibus vel. Nullam pellentesque luctus turpis vel blandit. Donec quis pulvinar arcu, sit amet posuere urna. Aenean maximus nunc eu risus vulputate sagittis. Curabitur ipsum tortor, gravida et nulla ut, consequat sollicitudin purus. Pellentesque vitae augue vitae sapien feugiat ultricies laoreet quis nibh. Vestibulum nunc velit, congue a nisi non, accumsan commodo libero. Sed mollis odio quis orci efficitur volutpat. Cras nec urna nec libero feugiat egestas. Nam eu tellus maximus, molestie enim eget, rutrum arcu. Vestibulum nec porttitor ipsum, a interdum purus. Donec eleifend dapibus leo ac cursus.",
                                version: 1,
                              },
                            ],
                            direction: "ltr",
                            format: "",
                            indent: 0,
                            textFormat: 0,
                            version: 1,
                          },
                        ],
                        direction: "ltr",
                        format: "",
                        indent: 0,
                        version: 1,
                      },
                    },
                  },
                ],
              },
            ],
          },
        ],
      });

      const post3 = await createPost(payload, {
        tenantId: tenant.id,
        slug: "post-3",
        title: "The only CMS solution you will ever need",
        meta: {
          title:
            "The only CMS solution you will ever need | Payload Website Template",
          description:
            "Discover the ultimate CMS solution tailored to meet all your content management needs. Powerful, user-friendly, and scalable for businesses of all sizes.",
        },
        categories: [category1.id],
        layout: [
          {
            customBlocks: [
              {
                blockType: "content",
                columns: [
                  {
                    size: "full",
                    richText: {
                      root: {
                        type: "root",
                        children: [
                          {
                            type: "heading",
                            children: [
                              {
                                type: "text",
                                detail: 0,
                                format: 0,
                                mode: "normal",
                                style: "",
                                text: "This is demo post",
                                version: 1,
                              },
                            ],
                            direction: "ltr",
                            format: "",
                            indent: 0,
                            tag: "h2",
                            version: 1,
                          },
                          {
                            type: "block",
                            fields: {
                              blockName: "Disclaimer",
                              blockType: "banner",
                              content: {
                                root: {
                                  type: "root",
                                  children: [
                                    {
                                      type: "paragraph",
                                      children: [
                                        {
                                          type: "text",
                                          detail: 0,
                                          format: 1,
                                          mode: "normal",
                                          style: "",
                                          text: "Disclaimer:",
                                          version: 1,
                                        },
                                        {
                                          type: "text",
                                          detail: 0,
                                          format: 0,
                                          mode: "normal",
                                          style: "",
                                          text: " This is not real tutorial!",
                                          version: 1,
                                        },
                                      ],
                                      direction: "ltr",
                                      format: "",
                                      indent: 0,
                                      textFormat: 0,
                                      version: 1,
                                    },
                                  ],
                                  direction: "ltr",
                                  format: "",
                                  indent: 0,
                                  version: 1,
                                },
                              },
                              style: "info",
                            },
                            format: "",
                            version: 2,
                          },
                          {
                            type: "paragraph",
                            children: [
                              {
                                type: "text",
                                detail: 0,
                                format: 0,
                                mode: "normal",
                                style: "",
                                text: "Payload CMS is the ultimate choice for developers and businesses, offering unmatched flexibility, a modern developer-first approach, and an intuitive interface. Its headless architecture, rich API, and scalability make it perfect for delivering content across platforms, leaving no alternative that truly compares.",
                                version: 1,
                              },
                            ],
                            direction: "ltr",
                            format: "",
                            indent: 0,
                            textFormat: 0,
                            version: 1,
                          },
                        ],
                        direction: "ltr",
                        format: "",
                        indent: 0,
                        version: 1,
                      },
                    },
                  },
                ],
              },
            ],
          },
        ],
      });

      payload.logger.info(`- (${tenantSlug}) Seeding dynamic pages`);

      const doc = await createPage(payload, {
        tenantId: tenant.id,
        pageTemplate: "documentationPage",
        slug: "doc-1",
        title: "Documantation page",
        header: "Example of documantation page",
        text: "This page should be rendered using documentation page layout.",
      });

      const prod = await createPage(payload, {
        tenantId: tenant.id,
        pageTemplate: "productPage",
        slug: "prod-1",
        title: "Product page",
        header: "Example of product page",
        text: "This page should be rendered using product page layout.",
        products: {
          category: ["property"],
          consumers: ["commercial_customer"],
          country: ["global"],
          type: ["buy_Insurance"],
          references: [
            {
              productId: "",
            },
          ],
        },
      });

      await Promise.all([
        await payload.update({
          id: post1.id,
          collection: COLLECTION_SLUG_DYANMIC_PAGE,
          context: {
            disableRevalidate: true,
          },
          depth: 0,
          data: {
            related: {
              relatedContent: [post2.id, post3.id],
            },
          },
        }),
        await payload.update({
          id: post2.id,
          collection: COLLECTION_SLUG_DYANMIC_PAGE,
          context: {
            disableRevalidate: true,
          },
          depth: 0,
          data: {
            related: {
              relatedContent: [post1.id, post3.id],
            },
          },
        }),
        await payload.update({
          id: post3.id,
          collection: COLLECTION_SLUG_DYANMIC_PAGE,
          context: {
            disableRevalidate: true,
          },
          depth: 0,
          data: {
            related: {
              relatedContent: [post1.id, post2.id],
            },
          },
        }),
      ]);

      payload.logger.info(
        `- (${tenantSlug}) Updating tenant global settings...`
      );
      await updateTenantWithLinks(payload, {
        tenantId: tenant.id,
        homePageId: homePage.id,
        links: [
          {
            label: "Direct Link to Child Page",
            type: "reference",
            reference: {
              relationTo: COLLECTION_SLUG_DYANMIC_PAGE,
              value: childPage.id,
            },
          },
          {
            label: "Direct Link to Grand Child Page",
            type: "reference",
            reference: {
              relationTo: COLLECTION_SLUG_DYANMIC_PAGE,
              value: grandChildPage.id,
            },
          },
          {
            label: "Post 1",
            type: "reference",
            reference: {
              relationTo: COLLECTION_SLUG_DYANMIC_PAGE,
              value: post1.id,
            },
          },
          {
            label: "Post 2",
            type: "reference",
            reference: {
              relationTo: COLLECTION_SLUG_DYANMIC_PAGE,
              value: post2.id,
            },
          },
          {
            label: "Post 3",
            type: "reference",
            reference: {
              relationTo: COLLECTION_SLUG_DYANMIC_PAGE,
              value: post3.id,
            },
          },
          {
            label: "Documentation Page",
            type: "reference",
            reference: {
              relationTo: COLLECTION_SLUG_DYANMIC_PAGE,
              value: doc.id,
            },
          },
          {
            label: "Product Page",
            type: "reference",
            reference: {
              relationTo: COLLECTION_SLUG_DYANMIC_PAGE,
              value: prod.id,
            },
          },
        ],
      });

      await Promise.all([
        await payload.update({
          id: post1.id,
          collection: COLLECTION_SLUG_DYANMIC_PAGE,
          context: {
            disableRevalidate: true,
          },
          depth: 0,
          data: {
            related: {
              relatedContent: [post2.id, post3.id],
            },
          },
        }),
        await payload.update({
          id: post2.id,
          collection: COLLECTION_SLUG_DYANMIC_PAGE,
          context: {
            disableRevalidate: true,
          },
          depth: 0,
          data: {
            related: {
              relatedContent: [post1.id, post3.id],
            },
          },
        }),
        await payload.update({
          id: post3.id,
          collection: COLLECTION_SLUG_DYANMIC_PAGE,
          context: {
            disableRevalidate: true,
          },
          depth: 0,
          data: {
            related: {
              relatedContent: [post1.id, post2.id],
            },
          },
        }),
      ]);

      payload.logger.info(
        `- (${tenantSlug}) Updating tenant global settings...`
      );
      await updateTenantWithLinks(payload, {
        tenantId: tenant.id,
        homePageId: homePage.id,
        links: [
          {
            label: "Direct Link to Child Page",
            type: "reference",
            reference: {
              relationTo: COLLECTION_SLUG_DYANMIC_PAGE,
              value: childPage.id,
            },
          },
          {
            label: "Direct Link to Grand Child Page",
            type: "reference",
            reference: {
              relationTo: COLLECTION_SLUG_DYANMIC_PAGE,
              value: grandChildPage.id,
            },
          },
          {
            label: "Post 1",
            type: "reference",
            reference: {
              relationTo: COLLECTION_SLUG_DYANMIC_PAGE,
              value: post1.id,
            },
          },
          {
            label: "Post 2",
            type: "reference",
            reference: {
              relationTo: COLLECTION_SLUG_DYANMIC_PAGE,
              value: post2.id,
            },
          },
          {
            label: "Post 3",
            type: "reference",
            reference: {
              relationTo: COLLECTION_SLUG_DYANMIC_PAGE,
              value: post3.id,
            },
          },
          {
            label: "Documentation Page",
            type: "reference",
            reference: {
              relationTo: COLLECTION_SLUG_DYANMIC_PAGE,
              value: doc.id,
            },
          },
          {
            label: "Product Page",
            type: "reference",
            reference: {
              relationTo: COLLECTION_SLUG_DYANMIC_PAGE,
              value: prod.id,
            },
          },
        ],
      });

      payload.logger.info(`- (${tenantSlug}) Updating richText references...`);
      const { docs } = await payload.find({
        collection: COLLECTION_SLUG_DYANMIC_PAGE,
        limit: 100,
        where: {
          tenant: {
            equals: tenant.id,
          },
        },
      });

      for (const doc of docs) {
        await updateReferenceTrack({
          result: doc,
          operation: "update",
          req: {
            payload,
          },
          collection: {
            slug: COLLECTION_SLUG_DYANMIC_PAGE,
          },
        } as any);
      }

      payload.logger.info(`- (${tenantSlug}) Done seeding tenant`);
    })
  );

  payload.logger.info("Seeded database successfully!");
};

try {
  await seed();
} catch (e) {
  console.error(JSON.stringify(e));
  process.exit(1);
}

process.exit(0);