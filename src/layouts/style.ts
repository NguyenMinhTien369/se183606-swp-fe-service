export const getNavLinkClass = ({ isActive }: { isActive: boolean }) => {
  const baseClass =
    "px-5 py-2.5 rounded-full font-medium transition-all duration-300 flex items-center gap-2 text-sm sm:text-base";
  return isActive
    ? `${baseClass} bg-white text-slate-900 shadow-md scale-105`
    : `${baseClass} text-slate-500 hover:text-slate-900 hover:bg-gray-300/50`;
};
