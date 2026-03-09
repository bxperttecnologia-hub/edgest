import { ArrowUpRight } from "lucide-react";

export const SocialProof = () => {
  return (
    <div className="flex items-center justify-between p-4 rounded-2xl border border-border hover:border-primary/50 transition-all group cursor-pointer">
      <div className="flex items-center gap-3">
        <div className="flex -space-x-2">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 border-2 border-background flex items-center justify-center text-white font-semibold text-sm">
            A
          </div>
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-400 to-purple-600 border-2 border-background flex items-center justify-center text-white font-semibold text-sm">
            B
          </div>
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-pink-400 to-pink-600 border-2 border-background flex items-center justify-center text-white font-semibold text-sm">
            C
          </div>
        </div>
        <div>
          <p className="font-semibold text-foreground">Junte-se a 20k+ Estudantes!</p>
          <p className="text-xs text-muted-foreground">Veja nossa comunidade de aprendizado</p>
        </div>
      </div>
      <div className="w-10 h-10 rounded-full border border-border flex items-center justify-center group-hover:bg-primary group-hover:border-primary transition-all">
        <ArrowUpRight className="h-5 w-5 text-foreground group-hover:text-white transition-colors" />
      </div>
    </div>
  );
};
