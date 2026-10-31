import React from "react";

export const Table: React.FC<React.TableHTMLAttributes<HTMLTableElement>> = ({
  children,
  className = "",
  ...props
}) => {
  return (
    <div className="overflow-x-auto w-full rounded-2xl border border-[rgba(138,132,196,0.25)] bg-white/[0.03] backdrop-blur-xl shadow-[0_8px_32px_rgba(0,0,0,0.36)]">
      <table
        className={`w-full text-left text-sm text-[#D1CEE5] border-collapse ${className}`}
        {...props}
      >
        {children}
      </table>
    </div>
  );
};

export const TableHeader: React.FC<
  React.HTMLAttributes<HTMLTableSectionElement>
> = ({ children, className = "", ...props }) => (
  <thead
    className={`bg-white/[0.04] border-b border-[rgba(138,132,196,0.2)] text-xs font-semibold uppercase tracking-wider text-[#A39EC8] ${className}`}
    {...props}
  >
    {children}
  </thead>
);

export const TableRow: React.FC<
  React.HTMLAttributes<HTMLTableRowElement>
> = ({ children, className = "", ...props }) => (
  <tr
    className={`border-b border-white/[0.04] hover:bg-white/[0.05] transition-colors ${className}`}
    {...props}
  >
    {children}
  </tr>
);

export const TableHead: React.FC<
  React.ThHTMLAttributes<HTMLTableCellElement>
> = ({ children, className = "", ...props }) => (
  <th className={`px-4 py-3.5 font-medium ${className}`} {...props}>
    {children}
  </th>
);

export const TableCell: React.FC<
  React.TdHTMLAttributes<HTMLTableCellElement>
> = ({ children, className = "", ...props }) => (
  <td className={`px-4 py-3.5 align-middle ${className}`} {...props}>
    {children}
  </td>
);
