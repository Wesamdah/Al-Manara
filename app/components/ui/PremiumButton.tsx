type PremiumButtonProps = {
  children: React.ReactNode;
  type?: "button" | "submit" | "reset";
};

export function PremiumButton({ children, type }: PremiumButtonProps) {
  return (
    <button
      type={type}
      className="primary-button h-12 w-full rounded-2xl px-5 text-sm font-semibold text-white hover:opacity-90 dark:text-[#3f4041]"
    >
      {children}
    </button>
  );
}
