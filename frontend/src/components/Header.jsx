import { Link } from "react-router-dom";

const Header = () => {
  return (
    <header className="
      fixed top-0 left-0 right-0 h-16 z-[100]
      bg-white/60 backdrop-blur-xl shadow-md
      flex items-center px-8
      border-b border-slate-200
    ">
      <Link to="/" className="flex items-center gap-3 h-full">
        <img className="h-12 w-12 object-contain" src="./bot.png" alt="bot" />
        <span className="text-2xl font-bold text-blue-700 drop-shadow">GotyBot</span>
      </Link>
    </header>
  );
};

export default Header;
