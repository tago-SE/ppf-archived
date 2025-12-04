"use client";

import React from "react";

import { Button as PayloadButton, useAuth } from "@payloadcms/ui";

export const LogoutClient = () => {
  const { logOut } = useAuth();
  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    /// TODO: Need to add federated-logout and break out that logic into a useLogoutHook to facilitate such re-use.
    event.preventDefault();
    await logOut();
    window.location.href = "/admin/logout";
  };
  return (
    <form onSubmit={handleSubmit}>
      <PayloadButton
        type="submit"
        className="absolute bottom-8 left-8 cursor-pointer"
      >
        Sign Out
      </PayloadButton>
    </form>
  );
};

export default LogoutClient;
