import React from "react";
import { FolderOpen } from "lucide-react";

interface EmptyStateProps {
  title?: string;
  description?: string;
  icon?: React.ReactNode;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title = "No data found",
  description = "There are no records matching this criteria at the moment.",
  icon
}) => {
  return (
    <div className="glass rounded-2xl border border-white/5 p-8 text-center flex flex-col items-center justify-center max-w-md mx-auto my-8">
      <div className="p-4 bg-white/5 rounded-full text-slate-400 mb-4 animate-bounce">
        {icon || <FolderOpen className="h-8 w-8 text-cyan-400 text-glow" />}
      </div>
      <h3 className="text-lg font-semibold text-slate-200">{title}</h3>
      <p className="text-sm text-slate-400 mt-2">{description}</p>
    </div>
  );
};
