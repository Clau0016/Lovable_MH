import { useEffect } from "react";
import { Btn } from "./ui";

export function MatchModal({ me, other, onChat, onClose }: { me: string | null; other: string | null; onChat: () => void; onClose: () => void }) {
  useEffect(() => {
    const h = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [onClose]);
  const Av = ({ src, cls }: { src: string | null; cls: string }) => (
    <div className={`size-28 overflow-hidden rounded-full border-4 border-background bg-surface ${cls}`}>{src && <img src={src} alt="" className="h-full w-full object-cover" />}</div>
  );
  return (
    <div role="dialog" aria-modal className="fixed inset-0 z-50 flex flex-col items-center justify-center gap-6 bg-overlay px-6 text-center text-primary-foreground">
      <h2 className="text-[34px] font-medium tracking-wide">IT'S A MATCH!</h2>
      <p className="text-primary-foreground/70">Avete scelto di conoscervi</p>
      <div className="flex"><Av src={me} cls="match-left" /><Av src={other} cls="match-right" /></div>
      <div className="flex w-full max-w-xs flex-col gap-3">
        <Btn variant="outline" onClick={onChat}>Scrivi subito</Btn>
        <button onClick={onClose} className="py-2 text-sm text-primary-foreground/70 hover:text-primary-foreground">Continua a esplorare</button>
      </div>
    </div>
  );
}
