import React from "react";
import userSeif from "../assets/user-seif.jpeg";
import grizzly from "../assets/grizzlypng.jpeg";
import davolaf from "../assets/davolaf.jpeg";
import bleachy from "../assets/bleachy.jpeg";
import strawb from "../assets/strawb.jpeg";
import { useNavigate } from "react-router-dom";

const Home = () => {
  const navigate = useNavigate();
  const creators = [
    {
      name: "User Seif",
      pfp: userSeif,
      uid: 123,
    },
    {
      name: "Grizzlypng",
      pfp: grizzly,
      uid: 456,
    },
    {
      name: "Davolaf",
      pfp: davolaf,
      uid: 789,
    },
    {
      name: "Bleachy",
      pfp: bleachy,
      uid: 789456,
    },
    {
      name: "Strawbewwiii",
      pfp: strawb,
      uid: 789123,
    },
  ];

  function handleClick(creator) {
    navigate("/creator", { state: { creator } });
  }

  return (
    <div className="w-screen h-screen bg-neutral-900 flex flex-col items-center">
      <div className="w-11/12 h-screen text-white text-2xl grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-10 justify-items-center items-center p-5">
        {creators.map((creator, index) => (
          <button
            onClick={() => handleClick(creator)}
            className="w-72 h-72 border-2 border-solid border-neutral-700 bg-neutral-800 rounded-lg flex flex-col items-center justify-center p-5 hover:bg-neutral-500 duration-300"
            key={index}
            name={creator.name}
            value={creator.uid}
          >
            <p>{creator.name}</p>
            <img
              className="w-full object-cover rounded-full border-solid border-2 border-neutral-700"
              src={creator.pfp}
              alt="creator image"
            ></img>
            {console.log(creator.pfp)}
          </button>
        ))}
      </div>
    </div>
  );
};

export default Home;
