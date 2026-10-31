import React from "react";

export interface SpotlightCardProps
  extends React.HTMLAttributes<HTMLDivElement> {
  spotlightColor?: string;
  borderColor?: string;
}

export const SpotlightCard: React.FC<SpotlightCardProps> = ({
  children,
  className = "",
  ...props
}) => {
  return (
    <div
      className={`rounded-[12px] bg-white border border-[#F0DCE2] p-6 shadow-[0_1px_2px_rgba(30,26,28,0.04)] ${className}`}
      {...props}
    >
      <div>{children}</div>
    </div>
  );
};
