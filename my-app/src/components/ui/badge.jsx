import * as React from "react";
import { cva } from "class-variance-authority";

// 1. Définition des variantes (Lien avec ton CSS)
const badgeVariants = cva(
    "badge-base",
    {
        variants: {
            variant: {
                default: "badge-default",
                secondary: "badge-secondary",
                destructive: "badge-destructive",
                outline: "badge-outline",
            },
        },
        defaultVariants: {
            variant: "default",
        },
    },
);

// 2. Le composant
function Badge({ className, variant, ...props }) {
    const Comp = "span"; 

    return (
        <Comp
            data-slot="badge"
            className={`${badgeVariants({ variant })} ${className || ""}`}  
            {...props}
        />
    );
}

export{Badge};