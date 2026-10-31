import React from "react";

export const Table: React.FC<React.TableHTMLAttributes<HTMLTableElement>> = ({
  children,
  className = "",
  ...props
}) => {
  return (
    <div className="overflow-x-auto w-full rounded-[12px] border border-[#F0DCE2] bg-white shadow-[0_1px_2px_rgba(30,26,28,0.04)]">
      <table
        className={`w-full text-left text-sm text-[#1E1A1C] border-collapse ${className}`}
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
    className={`bg-[#FAF4F6] border-b border-[#F0DCE2] text-xs font-semibold uppercase tracking-wider text-[#6E6268] ${className}`}
    {...props}
  >
    {children}
  </thead>
);

export const TableRow: React.FC<
  React.HTMLAttributes<HTMLTableRowElement>
> = ({ children, className = "", ...props }) => (
  <tr
    className={`border-b border-[#F0DCE2] hover:bg-[#FAF4F6] transition-colors ${className}`}
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
