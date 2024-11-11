import React, { useState } from "react";
import userSeif from "../assets/user-seif.jpeg";
import grizzly from "../assets/grizzlypng.jpeg";
import davolaf from "../assets/davolaf.jpeg";
import bleachy from "../assets/bleachy.jpeg";
import strawb from "../assets/strawb.jpeg";
import Rhythma from "../../src/assets/Rhythma.png";
import { useNavigate } from "react-router-dom";

const Home = () => {
  const navigate = useNavigate();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const creators = [
    {
      name: "User Seif",
      pfp: userSeif,
      uid: 123,
      link: "https://linktr.ee/UserSeif",
    },
    {
      name: "Grizzlypng",
      pfp: grizzly,
      uid: process.env.REACT_APP_GRIZZLYUID,
      link: "https://linktr.ee/grizzlypng",
    },
    {
      name: "Davolaf",
      pfp: davolaf,
      uid: process.env.REACT_APP_DAVOLAFUID,
      link: "https://linktr.ee/davolaf",
    },
    {
      name: "Bleachy",
      pfp: bleachy,
      uid: 789456,
      link: "https://linktr.ee/bleachyosu",
    },
    {
      name: "Strawbewwiii",
      pfp: strawb,
      uid: 789123,
      link: "https://linktr.ee/strawbewwiii",
    },
  ];

  function handleClick(creator) {
    navigate("/creator", { state: { creator } });
  }

  function handleLogin() {
    navigate("/login");
  }

  return (
    <div className="text-white w-screen min-h-screen bg-gradient-to-r from-black via-neutral-600 to-black flex flex-col items-center justify-center">
      <div className="flex flex-col h-1/4 items-center w-full justify-center m-5 mt-10">
        <h1 className="text-5xl">Rhythma</h1>
        <p className="text-xl text-center mt-3">
          Connecting Creators And Community Through Music
        </p>
      </div>
      <div className="flex flex-col flex-grow w-3/4 text-white text-2xl shadow-[rgba(0,0,15,0.5)_0px_5px_25px_5px] shadow-black from-neutral-900 via-neutral-500 to-neutral-900 rounded-lg m-10 justify-center">
        {/* <div className="flex w-1/4 h-72 items-center justify-center">
            <img className="w-48 rounded-full" src={Rhythma} />
          </div> */}
        {/* <div className="flex flex-col justify-center items-center">
          <h1>Meet our Creators</h1>
        </div> */}
        <div className="w-full grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 justify-items-center items-start p-10">
          {creators.map((creator, index) => (
            <button
              onClick={() => handleClick(creator)}
              className="w-52 h-72 border-2 border-solid border-neutral-900 shadow-[rgba(0,0,15,0.5)_0px_5px_25px_5px] shadow-black bg-neutral-700 rounded-lg flex flex-col items-center justify-center p-5 hover:bg-neutral-400 hover:-translate-y-3 hover:shadow-[rgba(0,0,15,0.5)_0px_5px_25px_5px] hover:shadow-white duration-300"
              key={index}
              name={creator.name}
              value={creator.uid}
            >
              <img
                className="w-full object-cover rounded-full border-solid border-2 border-neutral-700"
                src={creator.pfp}
                alt="creator image"
              ></img>
              <p>{creator.name}</p>
              {console.log(creator.pfp)}
            </button>
          ))}
        </div>
      </div>
      <div className="flex w-full justify-start pl-10 pb-10">
        <p className="mr-1">Founders</p>
        <button
          className="hover:underline hover:-translate-y-1 underline-offset-8 duration-300"
          onClick={handleLogin}
        >
          Log In Here
        </button>
      </div>
    </div>
  );
};

export default Home;
