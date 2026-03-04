import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva } from "class-variance-authority";
import "./Button.css";

const buttonVariants = cva(
  "btn-base", 
  {
    variants: {
      variant: {
        default: "btn-default",
        destructive: "btn-destructive",
        outline: "btn-outline",
        secondary: "btn-secondary",
        ghost: "btn-ghost",
        link: "btn-link",
      },
      size: {
        default: "btn-size-default",
        sm: "btn-size-sm",
        lg: "btn-size-lg",
        icon: "btn-size-icon",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

function Button({ className, variant, size, asChild = false, ...props }) {
  // On utilise Slot si asChild est vrai (pratique pour transformer un bouton en lien)
  const Comp = asChild ? Slot : "button";

  return (
    <Comp
      data-slot="button"
      className={`${buttonVariants({ variant, size })} ${className || ""}`}
      {...props}
    />
  );
}

export { Button, buttonVariants };