import * as React from "react";

function Separator({
  className,
  orientation = "horizontal",
  decorative = true,
  ...props
}) {
  return (
    <div
      // Rôle sémantique pour l'accessibilité
      role={decorative ? "none" : "separator"}
      aria-orientation={orientation}
      data-orientation={orientation}
      data-slot="separator-root"
      // Combinaison des classes CSS
      className={`separator-root ${className || ""}`}
      {...props}
    />
  );
}

export { Separator };