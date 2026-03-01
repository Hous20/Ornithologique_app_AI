import * as React from 'react';


function Card({className, children, ...props}) {
    return (
        <div
         data-slot="card"
         className={
            "bg-card text-card-foreground flex flex-col gap-6 rounded-xl border " + (className || "")
         }
         {...props}
        >
          {children}
        </div>
    );
}

function Cardheader({className, ...props}) {
    return (
        <div
            data-slot="card-header"
            className={
                "card-header" + className}
            {...props}
        />
    );
}

function CardTitle({ className, ...props }){
  return (
    <h4
      data-slot="card-title"
      className={"leading-none" + className}
      {...props}
    />
  );
}

function CardDescription({ className, ...props }) {
  return (
    <p
      data-slot="card-description"
      className={"text-muted-foreground" + className}
      {...props}
    />
  );
}

function CardAction({ className, ...props }) {
  return (
    <div
      data-slot="card-action"
      className={
        "col-start-2 row-span-2 row-start-1 self-start justify-self-end"+
        className
      }
      {...props}
    />
  );
}

// On ajoute 'children' dans la décomposition des arguments
function CardContent({ className, children, ...props }) {
  const baseClass = "p-6 pb-6";
  const combinedClass = className ? `${baseClass} ${className}` : baseClass;

  return (
    <div
      data-slot="card-content"
      className={combinedClass}
      {...props}
    >
      {/* On affiche ici le contenu passé au composant */}
      {children} 
    </div>
  );
}
export {
    Card,
    Cardheader,
    CardTitle,
    CardDescription,
    CardAction,
    CardContent
}