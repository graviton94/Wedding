const Divider = () => {
  return (
    <div
      className="w-full bg-theme-bg py-5 flex items-center justify-center gap-3"
      aria-hidden="true"
    >
      <span className="h-px w-14 bg-gradient-to-r from-transparent to-theme-accent/50" />
      <span className="text-theme-accent/80 text-sm leading-none">&#10086;</span>
      <span className="h-px w-14 bg-gradient-to-l from-transparent to-theme-accent/50" />
    </div>
  );
};

export default Divider;
