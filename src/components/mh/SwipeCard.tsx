import { motion, useMotionValue, useTransform, animate } from "framer-motion";
import { forwardRef, useImperativeHandle } from "react";
import type { FeedItem, SwipeAction } from "@/lib/domain";
import { PhotoGallery } from "./ProfileCard";
import { euro } from "@/lib/format";
import { Tag } from "./ui";

export type SwipeHandle = { fling: (a: SwipeAction) => void };

export const SwipeCard = forwardRef<SwipeHandle, { profile: FeedItem; isTop: boolean; depth: number; compat: number | null; onSwipe: (id: string, a: SwipeAction) => void; onOpen: () => void }>(
  function SwipeCard({ profile, isTop, depth, compat, onSwipe, onOpen }, ref) {
    const x = useMotionValue(0);
    const rotate = useTransform(x, [-200, 0, 200], [-15, 0, 15]);
    const smashOp = useTransform(x, [20, 120], [0, 1]);
    const passOp = useTransform(x, [-120, -20], [1, 0]);
    const fling = (a: SwipeAction) => {
      const w = typeof window !== "undefined" ? window.innerWidth : 600;
      animate(x, a === "SMASH" ? w : -w, { duration: 0.28 }).then(() => onSwipe(profile.user_id, a));
    };
    useImperativeHandle(ref, () => ({ fling }));
    const p = profile;
    return (
      <motion.div
        className="absolute inset-0 overflow-hidden rounded-[20px] border border-border bg-card"
        style={{ x, rotate, touchAction: "pan-y", zIndex: 10 - depth }}
        initial={false}
        animate={{ scale: 1 - depth * 0.05, y: depth * -8 }}
        drag={isTop ? "x" : false}
        dragSnapToOrigin={false}
        onDragEnd={(_, info) => {
          const w = (typeof window !== "undefined" ? Math.min(window.innerWidth, 480) : 400) * 0.3;
          if (info.offset.x > w || info.velocity.x > 500) fling("SMASH");
          else if (info.offset.x < -w || info.velocity.x < -500) fling("PASS");
          else animate(x, 0, { type: "spring", stiffness: 400, damping: 30 });
        }}
      >
        <PhotoGallery photos={p.photos} className="h-[68%]" />
        <motion.div style={{ opacity: smashOp }} className="pointer-events-none absolute inset-0 bg-smash/15">
          <span className="absolute left-5 top-8 -rotate-12 rounded-lg border-2 border-smash px-3 py-1 text-xl font-medium tracking-wider text-smash">SMASH</span>
        </motion.div>
        <motion.div style={{ opacity: passOp }} className="pointer-events-none absolute inset-0 bg-pass/15">
          <span className="absolute right-5 top-8 rotate-12 rounded-lg border-2 border-pass px-3 py-1 text-xl font-medium tracking-wider text-pass">PASS</span>
        </motion.div>
        <button onClick={onOpen} className="block w-full space-y-1.5 p-4 text-left">
          {p.user_type === "LANDLORD" ? (
            <>
              <div className="flex items-start justify-between gap-3"><h3 className="line-clamp-1 text-[17px]">{p.title}</h3><span className="font-medium text-smash">{euro(p.rent)}/mo</span></div>
              <p className="line-clamp-1 text-sm text-muted-foreground">{p.address}, {p.city}{p.square_meters ? ` · ${p.square_meters} m²` : ""}</p>
            </>
          ) : (
            <>
              <h3 className="text-[17px]">{p.first_name} {p.last_name}, {p.age}</h3>
              <p className="line-clamp-1 text-sm text-muted-foreground">{p.occupation} · Budget {euro(p.budget_min)}–{euro(p.budget_max)}</p>
            </>
          )}
          {compat != null && <div className="pt-1"><Tag tone="smash">{compat}% compatibile</Tag></div>}
        </button>
      </motion.div>
    );
  },
);
