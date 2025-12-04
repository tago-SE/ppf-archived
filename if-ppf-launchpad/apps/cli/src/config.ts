import { AddonBase } from "./lib/addons";
import { Template } from "./lib/templates";

// templates
import nextjs from './scripts/create/nextjs';
import dotnet from './scripts/create/dotnet';

// addons
import tailwind from './scripts/add/tailwind';
import keyvault from './scripts/add/keyvault';
import appinsights from './scripts/add/appinsights';

export type TemplateId = "nextjs" | "dotnet";

export type AddonId = "tailwind" | "keyvault" | "appinsights";

export const templates: Record<TemplateId, Template> = {
    nextjs,
    dotnet
};

export const addons: Record<AddonId, AddonBase> = {
    tailwind,
    keyvault,
    appinsights
};