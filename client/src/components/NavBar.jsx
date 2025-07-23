import { Link, useNavigate } from "react-router-dom";
import React from "react";

const NavBar = () => {
  const navigate = useNavigate();
  return (
    <div className="w-full h-14 bg-gradient-to-b from-stone-700 via-stone-800 to-stone-900 border-b-2 border-neutral-700 flex justify-center">
      <div className="w-8/12 h-14 flex justify-between">
        <h1 className="text-3xl flex items-center">Rhythma</h1>
        <ul className="flex gap-4 items-center">
          <li className="text-lg hover:text-stone-400 hover:-translate-y-1 duration-300 ">
            <Link to="/">Home</Link>
          </li>
          <li className="text-lg hover:text-stone-400 hover:-translate-y-1 duration-300">
            <Link to="/maps">Maps</Link>
          </li>
        </ul>
      </div>
    </div>
  );
};

export default NavBar;
