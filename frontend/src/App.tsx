import React from 'react';
import { Sparkles, ShieldCheck } from 'lucide-react';

export const App: React.FC = () => {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col items-center justify-center p-6">
      <div className="max-w-md w-full p-6 bg-card text-card-foreground rounded-xl border border-border shadow-sm text-center">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 text-primary mb-4">
          <Sparkles className="w-6 h-6" />
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          🌉 योजनासेतु (YojanaSetu)
        </h1>
        <p className="text-sm text-muted-foreground mt-2 leading-relaxed">
          “Know what you qualify for. Know why. Know what to do next.”
        </p>

        <div className="mt-5 inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-medium bg-success/15 text-success border border-success/30">
          <ShieldCheck className="w-4 h-4" />
          <span>Step 4 Active: Tailwind CSS & shadcn/ui Initialized</span>
        </div>
      </div>
    </div>
  );
};

export default App;
