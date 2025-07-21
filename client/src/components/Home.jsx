import React, { useEffect, useState } from "react";
import userSeif from "../assets/user-seif.jpeg";
import grizzly from "../assets/grizzlypng.jpeg";
import davolaf from "../assets/davolaf.jpeg";
import bleachy from "../assets/bleachy.jpeg";
import strawb from "../assets/strawb.jpeg";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Card from "./Card";

const Home = () => {
  const navigate = useNavigate();

  const [maps, setMaps] = useState([]);
  const [mapDetails, setMapDetails] = useState({});
  const [search, setSearch] = useState("");

  const creators = [
    {
      name: "User Seif",
      pfp: userSeif,
      uid: process.env.REACT_APP_SEIFUID,
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
      uid: process.env.REACT_APP_BLEACHYUID,
      link: "https://linktr.ee/bleachyosu",
    },
    {
      name: "Strawbewwiii",
      pfp: strawb,
      uid: process.env.REACT_APP_STRAWUID,
      link: "https://linktr.ee/strawbewwiii",
    },
  ];

  async function getMaps() {
    try {
      const response = await axios.get(
        `${process.env.REACT_APP_API_URL}/getAllMaps`
      );
      const entries = response.data.map((entry) => ({
        mapLink: entry.map_link,
        uid: entry.user_id,
      }));
      const mapList = [];
      entries.forEach(({ mapLink, uid }, index) => {
        const isMediaFire = mapLink.includes("mediafire.com");
        const id = index;
        mapList.push({
          id,
          uid,
          isMediaFire,
          mapLink,
        });
        //Each object in the mapList array has 2 properties, the mapLink and a boolean if link contains mediafire
        setMaps(mapList);
      });
      //allMaps is now an array with maplinks
      //Iterate through allMaps, if osu link call osu api, otherwise mediafire
    } catch (error) {
      console.error("error fetching maps");
    }
  }

  //Iterates through the maps list and propogates mapDetails (filtering through osu maps and mediafire maps)
  async function getMapDetails() {
    const details = {};
    console.log(maps);
    const detailPromises = maps.map(async (map) => {
      let detail;
      if (map.isMediaFire) {
        detail = getMediaFireDetails(map.mapLink, map.uid);
      } else {
        detail = await getOsuDetails(map.mapLink, map.uid);
      }

      if (detail) {
        details[map.id] = detail; // Add the detail to the object
      }
    });

    await Promise.all(detailPromises);
    //THIS LINE IS EXTREMELY IMPORTANT
    //Code was only showing mediafiremaps because my await function call to get osu map details wasnt firing quick enough
    //This is because forEach deos not wait for async operations to complete, so setMapDetails was firing before waiting for data from osu api route
    //By using Promise.all() we can now wait for all async function to complete before proceeding with our setMapDetails hook
    //Promise.all takes an array of promises and resolves when all promises have resolved, if any fail, this will reject
    //When testing, I had an array of 2 promises and a media fire map. Promise.all resolved this issue

    // Combine new details with the existing state
    setMapDetails((prevDetails) => ({
      ...prevDetails,
      ...details,
    }));
  }

  //function to handle mediafire map details
  function getMediaFireDetails(mediaFireLink, uid) {
    const match = mediaFireLink.match(
      /\/file\/[^\/]+\/([^-]+)-(.+)\.osz\/file/
    );
    if (match) {
      const creator = creators.find((creator) => creator.uid === uid);
      console.log("UID's: ", uid);
      const artist = match[1].replace(/_/g, " ");
      const title = match[2].replace(/_/g, " ");
      return {
        artist,
        title,
        coverUrl: creator.pfp,
        creator: creator.name,
        beatmapLink: mediaFireLink,
        uid,
      };
    }
    return null;
  }

  //Helper function for getBeatmapDetails to extract the beatmap Set ID
  function extractBeatmapSetId(beatmapLink) {
    if (!beatmapLink || typeof beatmapLink !== "string") {
      return null;
    }
    const match = beatmapLink.match(/beatmapsets\/(\d+)/);
    const beatmapSetId = match ? match[1] : null;
    return beatmapSetId;
  }

  //function to handle osu map details
  async function getOsuDetails(beatmapLink, uid) {
    const beatmapSetId = extractBeatmapSetId(beatmapLink);

    if (!beatmapSetId) {
      return;
    }

    try {
      const response = await axios.get(
        `${process.env.REACT_APP_API_URL}/getBeatmapDetails`,
        {
          params: { beatmapSetId, uid, beatmapLink },
        }
      );
      return response.data;
    } catch (error) {
      return null;
    }
  }

  const filteredMaps = maps.filter(({ id }) => {
    const details = mapDetails[id];
    if (!details) {
      return false;
    }

    const searchLower = search.toLowerCase();
    return (
      details.title?.toLowerCase().includes(searchLower) ||
      details.artist?.toLowerCase().includes(searchLower) ||
      details.creator?.toLowerCase().includes(searchLower)
    );
  });

  useEffect(() => {
    getMaps();
  }, []);
  useEffect(() => {
    getMapDetails();
  }, [maps]);

  function handleClick(creator) {
    navigate("/creator", { state: { creator } });
  }
  function handleLogin() {
    navigate("/login");
  }
  function handleChange(event) {
    setSearch(event.target.value);
  }

  return (
    <div className="text-white min-w-screen min-h-screen bg-gradient-to-r from-black via-neutral-600 to-black flex flex-col items-center justify-center">
      <div className="flex flex-col w-1/2 h-1/4 items-center justify-center p-5 mt-10 rounded-lg shadow-[rgba(0,0,15,0.5)_0px_5px_25px_5px] border-2 border-solid border-neutral-500">
        <h1 className="text-5xl text-neutral-400">Rhythma</h1>
        <p className="text-xl text-center mt-3 text-neutral-400">
          Connecting Creators And Community Through Music
        </p>
      </div>
      <div className="flex flex-col flex-grow w-8/12 text-neutral-400 text-2xl shadow-[rgba(0,0,15,0.5)_0px_5px_25px_5px] shadow-black from-neutral-900 via-neutral-500 to-neutral-900 rounded-lg m-10 justify-center border-2 border-solid border-neutral-500">
        {/* <div className="flex w-1/4 h-72 items-center justify-center">
            <img className="w-48 rounded-full" src={Rhythma} />
          </div> */}
        {/* <div className="flex flex-col justify-center items-center">
          <h1>Meet our Creators</h1>
        </div> */}
        <h1 className="text-3xl text-neutral-400 flex justify-center pt-5">
          Partnered Creators
        </h1>
        <div className="w-full grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 justify-items-center items-start p-10">
          {creators.map((creator, index) => (
            <button
              onClick={() => handleClick(creator)}
              className="w-52 h-72 border-2 border-solid border-neutral-500 shadow-[rgba(0,0,15,0.5)_0px_5px_25px_5px] shadow-black bg-gradient-to-r from-black via-neutral-600 to-black rounded-lg flex flex-col items-center justify-center p-5 hover:bg-neutral-400 hover:-translate-y-3 hover:shadow-[rgba(0,0,15,0.5)_0px_5px_25px_5px] hover:shadow-white duration-300 hover:text-white"
              key={index}
              name={creator.name}
              value={creator.uid}
            >
              <img
                className="w-full object-cover rounded-full border-solid border-2 border-neutral-500"
                src={creator.pfp}
                alt="creator image"
              ></img>
              <p>{creator.name}</p>
            </button>
          ))}
        </div>
      </div>
      <div className="w-8/12 flex flex-col items-center md:flex-row justify-between">
        <h1 className="text-3xl text-neutral-400 flex justify-center pt-5 w-1/4 text-left mb-10">
          Beatmap Collection
        </h1>
        <input
          onChange={handleChange}
          placeholder="Search"
          className="w-1/4 border-2 border-solid border-neutral-500 shadow-[rgba(0,0,15,0.5)_0px_5px_25px_5px] shadow-black p-4 rounded-lg bg-gradient-to-r from-neutral-900 via-neutral-700 to-neutral-900 mb-10"
        ></input>
      </div>

      <div className="border-2 border-solid border-neutral-500 shadow-[rgba(0,0,15,0.5)_0px_5px_25px_5px] shadow-black bg-gradient-to-r from-neutral-900 via-neutral-700 to-neutral-900 rounded-lg w-8/12 p-12 text-white text-2xl overflow-auto grid grid-cols-1 md:grid-cols-2 gap-5">
        {filteredMaps.map(({ id, mapLink }, index) => (
          <Card
            details={mapDetails[id]}
            key={index}
            index={index}
            name={id}
            mapLink={mapLink}
          />
        ))}
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
