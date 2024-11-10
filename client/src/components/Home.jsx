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
    <div className="w-screen h-screen bg-gradient-to-r from-neutral-700 to-neutral-400 flex flex-col items-center justify-center">
      <div className="text-white text-2xl shadow-[rgba(0,0,15,0.5)_-10px_5px_30px_10px] shadow-black bg-neutral-700 rounded-lg w-2/3 h-5/6">
        <div className="w-full flex justify-between">
          {/* <div className="flex w-1/4 h-72 items-center justify-center">
            <img className="w-48 rounded-full" src={Rhythma} />
          </div> */}
          <div className="w-full h-72 flex flex-col justify-center items-center">
            <div className="w-3/4 flex flex-col items-center justify-center">
              <h1 className="text-5xl">Meet Our Creators</h1>
              <p className="text-base text-center">
                Rhythma brings together five of the most influential osu!
                creators, with a combined audience of over 5 million
                subscribers, to revolutionize how players and fans connect with
                their favorite maps, music, and exclusive content.
              </p>
            </div>
          </div>
        </div>
        <div className="w-full grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 justify-items-center items-center p-5">
          {creators.map((creator, index) => (
            <button
              onClick={() => handleClick(creator)}
              className="w-52 h-72 border-2 border-solid border-neutral-700 shadow-[rgba(0,0,15,0.5)_-10px_5px_10px_0px] shadow-black bg-neutral-500 rounded-lg flex flex-col items-center justify-center p-5 hover:bg-neutral-400 hover:-translate-y-3 duration-300"
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
    </div>
  );
};

export default Home;
