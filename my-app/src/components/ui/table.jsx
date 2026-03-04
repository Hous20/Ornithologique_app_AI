import * as React from "react";
import "./Table.css"; // N'oublie pas d'importer le CSS

function Table({ className, ...props }) {
  return (
    <div className="table-container" data-slot="table-container">
      <table className={`table-ui ${className || ""}`} {...props} />
    </div>
  );
}

function TableHeader({ className, ...props }) {
  return <thead className={`table-header ${className || ""}`} {...props} />;
}

function TableBody({ className, ...props }) {
  return <tbody className={`table-body ${className || ""}`} {...props} />;
}

function TableRow({ className, ...props }) {
  return <tr className={`table-row ${className || ""}`} {...props} />;
}

function TableHead({ className, ...props }) {
  return <th className={`table-head ${className || ""}`} {...props} />;
}

function TableCell({ className, ...props }) {
  return <td className={`table-cell ${className || ""}`} {...props} />;
}

function TableFooter({ className, ...props }) {
  return <tfoot className={`table-footer ${className || ""}`} {...props} />;
}

function TableCaption({ className, ...props }) {
  return <caption className={`table-caption ${className || ""}`} {...props} />;
}

export {
  Table,
  TableHeader,
  TableBody,
  TableFooter,
  TableHead,
  TableRow,
  TableCell,
  TableCaption,
};