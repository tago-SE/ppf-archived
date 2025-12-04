import {
  authStrategies,
  x_auth_method,
} from "@/lib/auth/payload/collection/strategy";
import { TenantBySlugHeader } from "@/lib/auth/utils/headers/x-ppf-tenant";
import { OpenAPIV3, OpenAPIV3_1 } from "openapi-types";

const authStrategyHeaderParameter: OpenAPIV3.ParameterObject &
  OpenAPIV3_1.ParameterObject = {
  in: "header",
  name: x_auth_method,
  description: `Valid auth strategies`,
  required: false,
  schema: {
    type: "string",
    enum: authStrategies.map((strategy) => strategy.name),
  },
};

const tenantHeaderParameter: OpenAPIV3.ParameterObject &
  OpenAPIV3_1.ParameterObject = {
  in: "header",
  name: TenantBySlugHeader,
  description: `The slug of the Tenant you wish to authenticate towards.`,
  required: false,
  schema: {
    type: "string",
  },
};

export const tenantAuthenticationHeaderParameters = [
  authStrategyHeaderParameter,
  tenantHeaderParameter,
];
