import * as React from "react";
import * as LabelPrimitive from "@radix-ui/react-label";
import "./Label.css";

function Label({ className, ...props }) {
  return (
    <LabelPrimitive.Root
      data-slot="label"
      className={`label-ui ${className || ""}`}
      {...props}
    />
  );
}

export { Label };