import React from "react";
import { Toaster as SonnerToaster } from "sonner";

export const Toaster = (props) => {
  return <SonnerToaster position="top-right" richColors {...props} />;
};

export default Toaster;
