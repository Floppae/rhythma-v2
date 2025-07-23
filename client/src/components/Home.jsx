import React, { useEffect, useState } from "react";
import userSeif from "../assets/user-seif.jpeg";
import grizzly from "../assets/grizzlypng.jpeg";
import davolaf from "../assets/davolaf.jpeg";
import bleachy from "../assets/bleachy.jpeg";
import strawb from "../assets/strawb.jpeg";
import { useNavigate } from "react-router-dom";
import { AiFillTikTok, AiFillInstagram, AiFillYoutube } from "react-icons/ai";
import NavBar from "./NavBar";

const Home = () => {
  const navigate = useNavigate();

  const creators = [
    {
      name: "User Seif",
      pfp: userSeif,
      uid: process.env.REACT_APP_SEIFUID,
      link: "https://linktr.ee/UserSeif",
      tiktok: "https://www.tiktok.com/@userseif_",
      insta: "https://www.instagram.com/userseif_/",
      youtube: "https://www.youtube.com/@UserSeif",
      tSubs: "1,200,000",
      iSubs: "80,000",
      ySubs: "920,000",
    },
    {
      name: "Grizzlypng",
      pfp: grizzly,
      uid: process.env.REACT_APP_GRIZZLYUID,
      link: "https://linktr.ee/grizzlypng",
      tiktok: "https://www.tiktok.com/@grizzlypng?lang=en",
      insta: "https://www.instagram.com/grizzlypng/?hl=en",
      youtube: "https://www.youtube.com/@gpng",
      tSubs: "470,000",
      iSubs: "3,000",
      ySubs: "300,000",
    },
    {
      name: "Davolaf",
      pfp: davolaf,
      uid: process.env.REACT_APP_DAVOLAFUID,
      link: "https://linktr.ee/davolaf",
      tiktok: "https://www.tiktok.com/@davolaf",
      insta: "https://www.instagram.com/davolaf_plays",
      youtube: "https://www.youtube.com/@DavolafShorts",
      tSubs: "840,000",
      iSubs: "42,000",
      ySubs: "1,200,000",
    },
    {
      name: "Bleachy",
      pfp: bleachy,
      uid: process.env.REACT_APP_BLEACHYUID,
      link: "https://linktr.ee/bleachyosu",
      tiktok: "https://www.tiktok.com/@bleachyosu?_t=8nrgJ9hdIuO&_r=1",
      insta: "https://www.instagram.com/bleachyosu?igshid=YmMyMTA2M2Y%3D",
      youtube: "https://www.youtube.com/@bleachyosu",
      tSubs: "640,000",
      iSubs: "4,000",
      ySubs: "700,000",
    },
    // {
    //   name: "Strawbewwiii",
    //   pfp: strawb,
    //   uid: process.env.REACT_APP_STRAWUID,
    //   link: "https://linktr.ee/strawbewwiii",
    //   tiktok: "tiktok.com/@userseif_",
    //   insta: "instagram.com/userseif_",
    //   youtube: "https://www.youtube.com/@UserSeif",
    //   tSubs: "1,200,000",
    //   iSubs: "80,000",
    //   ySubs: "920,000",
    // },
  ];

  function handleClick(creator) {
    navigate("/creator", { state: { creator } });
  }
  function handleLogin() {
    navigate("/login");
  }

  return (
    <div className="text-white min-w-screen min-h-screen bg-gradient-to-br from-stone-700 via-stone-800 to-stone-900 flex flex-col items-center">
      <NavBar />
      <div className="flex flex-col items-center w-8/12 h-1/4 p-10 mt-10 rounded-lg shadow-[rgba(0,0,15,0.5)_0px_5px_25px_5px] border-2 border-solid border-neutral-500 bg-gradient-to-br from-stone-700 via-stone-800 to-stone-800">
        <h1 className="text-4xl">File Hosting Made Simple</h1>
        <br></br>
        <p className="text-lg text-neutral-400 text-center">
          <p>
            Designed by Creators<p> Tailored For You</p>
          </p>
        </p>
      </div>
      <div className="flex flex-col flex-grow w-8/12 shadow-[rgba(0,0,15,0.5)_0px_5px_25px_5px] shadow-black from-neutral-900 via-neutral-500 to-neutral-900 rounded-lg m-10 p-10 justify-center border-2 border-solid border-neutral-500">
        <div className="w-full flex flex-col gap-8">
          <h1 className="text-4xl text-center mb-5">Partnered Creators</h1>
          {creators.map((creator, index) => (
            <div
              key={index}
              className={`flex items-center gap-8 mb-5 ${
                index % 2 === 0 ? "justify-between" : "justify-between"
              }`}
            >
              {/* For even indices (0, 2, 4...) - image left, text right */}
              {index % 2 === 0 ? (
                <>
                  <button
                    onClick={() => handleClick(creator)}
                    className="w-2/3 mx-10 border-2 border-solid border-neutral-500 shadow-[rgba(0,0,15,0.5)_0px_5px_25px_5px] shadow-black bg-transparent rounded-lg flex flex-col items-center justify-center p-5 hover:bg-neutral-500 hover:-translate-y-3 hover:shadow-[rgba(0,0,15,0.5)_0px_5px_25px_5px] hover:shadow-white duration-300 hover:text-white bg-gradient-to-br from-stone-800 via-stone-800 to-stone-700"
                    name={creator.name}
                    value={creator.uid}
                  >
                    <img
                      className="w-1/2 object-cover rounded-full border-solid border-2 border-neutral-500"
                      src={creator.pfp}
                      alt="creator image"
                    />
                    <p>{creator.name}</p>
                  </button>
                  <div className="w-full flex flex-col items-start max-w-md">
                    <h3 className="md:text-3xl font-bold mb-2">
                      {creator.name}
                    </h3>
                    <ul className="flex flex-col md:text-xl text-neutral-400">
                      <li className="flex gap-2">
                        <a href={creator.tiktok}>
                          <AiFillTikTok />
                        </a>
                        <p>{creator.tSubs}</p>
                      </li>
                      <li className="flex gap-2">
                        <a href={creator.insta}>
                          <AiFillInstagram />
                        </a>
                        <p>{creator.iSubs}</p>
                      </li>
                      <li className="flex gap-2">
                        <a href={creator.youtube}>
                          <AiFillYoutube />
                        </a>
                        <p>{creator.ySubs}</p>
                      </li>
                    </ul>
                  </div>
                </>
              ) : (
                /* For odd indices (1, 3, 5...) - text left, image right */
                <>
                  <div className="w-full flex flex-col items-end max-w-md">
                    <h3 className="md:text-2xl font-bold mb-2">
                      {creator.name}
                    </h3>
                    <ul className="flex flex-col md:text-xl text-neutral-400">
                      <li className="flex gap-2">
                        <a href={creator.tiktok}>
                          <AiFillTikTok />
                        </a>
                        <p>{creator.tSubs}</p>
                      </li>
                      <li className="flex gap-2">
                        <a href={creator.insta}>
                          <AiFillInstagram />
                        </a>
                        <p>{creator.iSubs}</p>
                      </li>
                      <li className="flex gap-2">
                        <a href={creator.youtube}>
                          <AiFillYoutube />
                        </a>
                        <p>{creator.ySubs}</p>
                      </li>
                    </ul>
                  </div>
                  <button
                    onClick={() => handleClick(creator)}
                    className="w-2/3 mx-10 border-2 border-solid border-neutral-500 shadow-[rgba(0,0,15,0.5)_0px_5px_25px_5px] shadow-black bg-transparent rounded-lg flex flex-col items-center justify-center p-5 hover:bg-neutral-500 hover:-translate-y-3 hover:shadow-[rgba(0,0,15,0.5)_0px_5px_25px_5px] hover:shadow-white duration-300 hover:text-white bg-gradient-to-br from-stone-800 via-stone-800 to-stone-700"
                    name={creator.name}
                    value={creator.uid}
                  >
                    <img
                      className="w-1/2 object-cover rounded-full border-solid border-2 border-neutral-500"
                      src={creator.pfp}
                      alt="creator image"
                    />
                    <p>{creator.name}</p>
                  </button>
                </>
              )}
            </div>
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
