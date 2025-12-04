import { CollectionSlug, PayloadRequest, TypedLocale, Where } from "payload";
import { GraphQLBoolean, GraphQLInterfaceType, GraphQLString } from "graphql/type";
import { COLLECTION_SLUG_DYANMIC_PAGE } from "@/collections/config";
import { QueryResolverConfig } from "./customQueries";
import pluralize from "pluralize";
import _ from "lodash";
import { pageTypes } from "@/collections/Pages/pageTemplate";
import { buildPaginatedListType } from "@payloadcms/graphql/types";
import { getTenantIdBySlug } from "../helpers";

// This is custom GraphQL resolver generator which generates resolver for COLLECTION by tenant. For example, MediaByTenant, PageByTenant, ArticleByTenant, ...
export function generateCollectionResolverByTenant({
  GraphQL,
  payload,
  overrideAccess,
}: QueryResolverConfig, collection: CollectionSlug, interfaces?: GraphQLInterfaceType[]) {
  const name = _.camelCase(collection);
  const docType = payload.collections[collection].graphQL!.type;
  return {
    [`${_.upperFirst(pluralize(name))}ByTenant`]: {
      type: buildPaginatedListType(
        `Tenant${_.upperFirst(pluralize(docType.name))}`,
        interfaces ? new GraphQL.GraphQLObjectType({
          name: `${docType.name}Base`,
          fields: docType.toConfig().fields,
          interfaces
        }) : docType
      ),
      args: {
        tenantSlug: { type: new GraphQL.GraphQLNonNull(GraphQLString) },
        where: {
          type: payload.collections[collection].graphQL!
            .whereInputType,
        },
        locale: { type: payload.types.localeInputType },
        draftMode: {
          type: new GraphQL.GraphQLNonNull(GraphQLBoolean)
        }
      },
      resolve: async (
        _: unknown,
        args: { tenantSlug: string; where: Where; locale?: TypedLocale, draftMode?: boolean },
        { req }: { req: PayloadRequest }
      ) => {
        const { tenantSlug, where, locale, draftMode } = args;
        const tenantId = await getTenantIdBySlug(req, overrideAccess, tenantSlug);
        const pages = await req.payload.find({
          collection: collection,
          depth: 0,
          req,
          overrideAccess: overrideAccess,
          where: {
            ...where,
            tenant: {
              equals: tenantId,
            },
            ...(draftMode ? {} : {
              _status: {
                equals: 'published'
              }
            })
          },
          locale: locale
        });

        return pages;
      },
    },
  };
}

// Helper function which generates base type for dynamic pages. This type contains all common fields!
export function getPageBaseInterface({
  GraphQL,
  payload,
}: QueryResolverConfig) {
  const docConfig = payload.collections[COLLECTION_SLUG_DYANMIC_PAGE].graphQL!.type.toConfig();

  const fieldsListedInAllTypes = _.intersection(...pageTypes.map(item => item.fields));
  const uncommonFields = _.uniq(_.difference(pageTypes.flatMap(x => x.fields), fieldsListedInAllTypes));
  const commonFields = _.difference(Object.keys(docConfig.fields), uncommonFields);
  const baseFields = _.pick(docConfig.fields, commonFields);

  return new GraphQL.GraphQLInterfaceType({
    name: 'PageBaseInterface',
    fields: baseFields
  });
}

// This is custom GraphQL resolver generator for dynamic pages/page templates. It generates graphql resolver for page type in collection. For example, ProductPageByTenant, ApplicationPageByTenant
export function generatePageResolverByTenant({
  GraphQL,
  payload,
  overrideAccess,
}: QueryResolverConfig, baseInterface: GraphQLInterfaceType, pageTemplate: string) {
  const docConfig = payload.collections[COLLECTION_SLUG_DYANMIC_PAGE].graphQL!.type.toConfig();
  const whereConfig = payload.collections[COLLECTION_SLUG_DYANMIC_PAGE].graphQL!.whereInputType.toConfig();

  const fieldsListedInAllTypes = _.intersection(...pageTypes.map(item => item.fields));
  const uncommonFields = _.uniq(_.difference(pageTypes.flatMap(x => x.fields), fieldsListedInAllTypes));
  const commonFields = _.difference(Object.keys(docConfig.fields), uncommonFields);
  const pageSpecificFields = _.difference(pageTypes.find(x => x.name == pageTemplate)?.fields, commonFields);
  const pageFields = _.intersection(Object.keys(docConfig.fields), [...commonFields, ...pageSpecificFields]);

  const whereInputFieldsPrefixOnly = _.intersection(
    _.uniq(Object.keys(whereConfig.fields).map(x => x.split('__')[0])),
    [
      ...pageFields,
      'AND',
      'OR'
    ]
  );

  const filterFieldsByPrefix = (names: string[], prefixes: string[]) => _.filter(names, name => _.some(prefixes, prefix => _.startsWith(name, prefix)));
  const whereInputFieldNames = filterFieldsByPrefix(Object.keys(whereConfig.fields), whereInputFieldsPrefixOnly)

  return {
    [`${_.upperFirst(pluralize(pageTemplate))}ByTenant`]: {
      type: buildPaginatedListType(
        `Tenant${_.upperFirst(pluralize(pageTemplate))}`,
        new GraphQL.GraphQLObjectType({
          name: _.upperFirst(pageTemplate),
          fields: _.pick(docConfig.fields, pageFields),
          interfaces: [baseInterface]
        })
      ),
      args: {
        tenantSlug: { type: new GraphQL.GraphQLNonNull(GraphQLString) },
        where: {
          type: new GraphQL.GraphQLInputObjectType({
            name: `${_.upperFirst(pageTemplate)}_where`,
            fields: {
              ..._.pick(whereConfig.fields, whereInputFieldNames)
            }
          }),
        },
        locale: { type: payload.types.localeInputType },
        draftMode: {
          type: new GraphQL.GraphQLNonNull(GraphQLBoolean)
        }
      },
      resolve: async (
        _: unknown,
        args: { tenantSlug: string; where: Where; locale?: TypedLocale, draftMode?: boolean },
        { req }: { req: PayloadRequest }
      ) => {
        const { tenantSlug, where, locale, draftMode } = args;
        const tenantId = await getTenantIdBySlug(req, overrideAccess, tenantSlug);
        const pages = await req.payload.find({
          collection: COLLECTION_SLUG_DYANMIC_PAGE,
          depth: 0,
          req,
          overrideAccess: overrideAccess,
          where: {
            ...where,
            pageTemplate: {
              equals: pageTemplate
            },
            tenant: {
              equals: tenantId,
            },
            ...(draftMode ? {} : {
              _status: {
                equals: 'published'
              }
            })
          },
          locale: locale
        });

        return pages;
      }
    }
  };
}
