import * as React from "react";
import "./Input.css";

function Input({ className, type, ...props }) {
  return (
    <input
      type={type}
      data-slot="input"
      className={`input-ui ${className || ""}`}
      {...props}
    />
  );
}

export { Input };