import { useState } from 'react';
import { Trophy, Plus, Church, Crown, UserPlus, BookOpen, BadgeCheck, HelpCircle } from 'lucide-react';
import type { Rule } from '@/hooks/useLeaderboardData';
import type { LucideIcon } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface RulesSectionProps {
  rules: Rule[];
}

export function RulesSection({ rules }: RulesSectionProps) {
  const [openTooltip, setOpenTooltip] = useState<number | null>(null);

  // Icon mapping for dynamic icon rendering
  const iconMap: Record<string, LucideIcon> = {
    Church,
    Crown,
    UserPlus,
    BookOpen,
    BadgeCheck,
    Plus, // fallback
  };

  return (
    <section className="py-12 px-4">
      <div className="container">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent/10 text-accent mb-4">
            <Trophy className="w-4 h-4" />
            <span className="text-sm font-medium">Como ganhar pontos</span>
          </div>
          <h2 className="text-2xl font-display font-bold text-foreground">
            Regras da Gincana
          </h2>
        </div>

        <TooltipProvider>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-2xl mx-auto">
            {rules.map((rule, index) => {
              const IconComponent = rule.icon && iconMap[rule.icon] ? iconMap[rule.icon] : Plus;
              return (
                <div
                  key={rule.id}
                  className="card-royal p-5 flex items-center gap-4 animate-fade-in"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-accent/10 border border-accent/20">
                    <IconComponent className="w-5 h-5 text-accent" />
                  </div>
                  <div className="flex-1 min-w-0 flex items-center gap-2">
                    <p className="font-medium text-foreground">{rule.description}</p>
                    {rule.explanation && (
                      <Tooltip
                        open={openTooltip === rule.id}
                        onOpenChange={(open) => setOpenTooltip(open ? rule.id : null)}
                      >
                        <TooltipTrigger asChild>
                          <button
                            onClick={() => setOpenTooltip(openTooltip === rule.id ? null : rule.id)}
                            className="flex-shrink-0 text-muted-foreground hover:text-foreground transition-colors"
                          >
                            <HelpCircle className="w-4 h-4" />
                          </button>
                        </TooltipTrigger>
                        <TooltipContent className="max-w-xs">
                          <p className="text-sm">{rule.explanation}</p>
                        </TooltipContent>
                      </Tooltip>
                    )}
                  </div>
                  <div className="flex-shrink-0 px-3 py-1.5 rounded-lg bg-accent text-accent-foreground font-bold text-sm">
                    +{rule.points}
                  </div>
                </div>
              );
            })}
          </div>
        </TooltipProvider>
      </div>
    </section>
  );
}
