import React from "react";

export const Toaster = () => null;

export const toast = {
  success: (msg) => console.log("Success:", msg),
  error: (msg) => console.error("Error:", msg),
  info: (msg) => console.log("Info:", msg),
};

export default Toaster;
