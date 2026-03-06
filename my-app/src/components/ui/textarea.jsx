import * as React from "react";
import "./Textarea.css";

function Textarea({ className, ...props }) {
  return (
    <textarea
      data-slot="textarea"
      className={`textarea-ui ${className || ""}`}
      {...props}
    />
  );
}

export { Textarea };