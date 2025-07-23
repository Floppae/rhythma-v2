import { Link, useNavigate } from "react-router-dom";
import React from "react";

const NavBar = () => {
  const navigate = useNavigate();
  return (
    <div className="w-full h-14 bg-stone-800 border-b-2 border-neutral-500 flex justify-center">
      <div className="w-8/12 h-14 flex justify-between">
        <h1 className="text-3xl flex items-center">Rhythma</h1>
        <ul className="flex gap-4 items-center">
          <li className="text-lg text-neutral-400 hover:text-white">
            <Link to="/">Home</Link>
          </li>
          <li className="text-lg text-neutral-400 hover:text-white">
            <Link to="/maps">Maps</Link>
          </li>
        </ul>
      </div>
    </div>
  );
};

export default NavBar;
