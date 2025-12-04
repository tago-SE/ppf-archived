import React from "react";

import { RecoverPasswordForm } from "./RecoverPasswordForm";

import classes from "./index.module.scss";
import { Gutter } from "@/app/_components/Gutter";

export default async function RecoverPassword() {
  return (
    <Gutter className={classes.recoverPassword}>
      <RecoverPasswordForm />
    </Gutter>
  );
}
