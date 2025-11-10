import { Link } from "react-router-dom";

const Header = () => {
  return (
    <header className="fixed top-0 px-40 items-end gap-4 left-0 flex flex-row right-0 h-16 z-50">

      <div className="flex items-center h-full">
        <Link to="/" className="flex flex-row items-center">
            <img className="h-20 w-20" src="./bot.png" alt="bot" />
            <p className="text-2xl font-bold text-blue-700">GotyBot</p>
        </Link>
      </div>

    </header>
  );
};

export default Header;
