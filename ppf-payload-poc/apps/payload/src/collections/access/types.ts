import type { Access, FieldAccess, TypedUser } from "payload";

export type AccessCheckerTypes = {
  fieldAccess: FieldAccess;
  access: Access;
};

export type TypedUserOmitCollection = Omit<TypedUser, "collection">;
