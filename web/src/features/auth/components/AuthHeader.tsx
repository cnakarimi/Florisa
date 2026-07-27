import { ArrowRight, Leaf } from "lucide-react";

interface AuthHeaderProps {
  title?: string;
  onBack?: () => void;
}

export function AuthHeader({ title, onBack }: AuthHeaderProps) {
  if (title && onBack) {
    return (
      <header className="relative z-10 mb-8 grid grid-cols-[2.5rem_1fr_2.5rem] items-center gap-2">
        <button
          type="button"
          onClick={onBack}
          className="flex size-10 cursor-pointer items-center justify-center rounded-full bg-[#20201f] text-[#e5e2e1] transition-[background-color,transform] hover:bg-[#353535] active:scale-95"
          aria-label="بازگشت"
        >
          <ArrowRight className="size-5" aria-hidden="true" />
        </button>
        <h1 className="truncate text-center text-xl font-semibold text-[#e5e2e1]">
          {title}
        </h1>
        <div className="size-10" aria-hidden="true" />
      </header>
    );
  }

  return (
    <header className="relative z-10 mb-8 flex items-center gap-2">
      <div className="flex size-9 items-center justify-center rounded-full border border-[#434846] bg-[#20201f] text-[#e9c349]">
        <Leaf className="size-5" aria-hidden="true" />
      </div>
      <span className="text-lg font-bold tracking-tight text-[#e5e2e1]">
        برگ سبز
      </span>
    </header>
  );
}

