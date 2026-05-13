type PremiumButtonProps = {
  children: React.ReactNode;
  type?: "button" | "submit";

  loading?: boolean;
};

export function PremiumButton({ children, type, loading }: PremiumButtonProps) {
  return (
    <button
      type={type}
      disabled={loading}
      className="
        primary-button
        h-12
        w-full
        rounded-2xl
        px-5
        text-sm
        font-semibold
        text-white
        transition-opacity

        hover:opacity-90

        disabled:cursor-not-allowed
        disabled:opacity-50

        dark:text-[#3f4041]
      "
    >
      {loading ? (
        <div className="flex items-center justify-center gap-2">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="w-4 fill-white inline animate-spin"
            viewBox="0 0 24 24"
          >
            <path
              d="M12 22c5.421 0 10-4.579 10-10h-2c0 4.337-3.663 8-8 8s-8-3.663-8-8c0-4.336 3.663-8 8-8V2C6.579 2 2 6.58 2 12c0 5.421 4.579 10 10 10z"
              data-original="#000000"
            />
          </svg>
        </div>
      ) : (
        children
      )}
    </button>
  );
}
