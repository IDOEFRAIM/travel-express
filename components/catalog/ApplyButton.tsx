'use client';

import { createApplicationAction } from "@/actions/application.actions";
import { useTransition } from "react";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

interface ApplyButtonProps {
  universityId: string;
  isConnected: boolean;
  className?: string;
  children?: React.ReactNode;
}

export function ApplyButton({ universityId, isConnected, className, children }: ApplyButtonProps) {
  const [isPending, startTransition] = useTransition();

  const handleApply = (e: React.MouseEvent) => {
    e.preventDefault(); // Prevent bubbling if inside a link/card
    e.stopPropagation();

    if (!isConnected) {
      window.location.href = `/login?redirect_uni=${universityId}`;
      return;
    }

    startTransition(async () => {
      await createApplicationAction(universityId);
    });
  };

  if (children) {
    return (
      <div 
        onClick={handleApply} 
        className={cn("cursor-pointer relative transition-all active:scale-95", className)}
      >
        {isPending && (
          <div className="absolute inset-0 flex items-center justify-center bg-white/50 backdrop-blur-[1px] rounded-full z-10">
            <div className="animate-spin h-4 w-4 border-2 border-blue-600 border-t-transparent rounded-full"></div>
          </div>
        )}
        {children}
      </div>
    );
  }

  return (
    <Button 
      onClick={handleApply} 
      isLoading={isPending}
      className={cn("w-full group", className)}
      variant={isConnected ? "glow" : "primary"}
    >
      <span className="flex items-center gap-2">
        {isConnected ? 'Lancez votre candidature' : 'Connectez-vous pour postuler'}
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="transition-transform group-hover:translate-x-1"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
      </span>
    </Button>
  );
}


