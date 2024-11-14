import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import axios from "axios";
import Card from "./Card";

const CreatorPage = () => {
  //useLocation is used to access the state passed from the Home component when we call handleClick
  const location = useLocation();
  const { creator } = location.state || {};
  //{Creator} will be whichever creator object was passed in (clicked on) from the home page
  //Ex) If grizzlypng was clicked on, all information from the creators object in Home.jsx about grizzlypng will be sent in
  const uid = creator.uid;
  const [maps, setMaps] = useState([]);
  const [mapDetails, setMapDetails] = useState({});
  //Initialize variables
  //uid is the id of The creator from firebase that we will use to index our pg database
  //maps will store map links
  //mapDetails will store the details of a map based on the corresponding index of maps

  async function getMaps() {
    try {
      const response = await axios.post(`${process.env.REACT_APP_URL}/maps`, {
        uid: creator.uid,
      });
      const mapLinks = response.data.map((mapEntry) => mapEntry.map_link);
      const mapList = [];
      mapLinks.forEach((mapLink, index) => {
        const isMediaFire = mapLink.includes("mediafire.com");
        const id = index;
        mapList.push({
          id,
          isMediaFire,
          mapLink,
        });
        //Each object in the mapList array has 2 properties, the mapLink and a boolean if link contains mediafire
        setMaps(mapList);
      });
      //allMaps is now an array with maplinks
      //Iterate through allMaps, if osu link call osu api, otherwise mediafire
    } catch (error) {}
  }

  //Iterates through the maps list and propogates mapDetails (filtering through osu maps and mediafire maps)
  async function getMapDetails() {
    const details = {};

    const detailPromises = maps.map(async (map) => {
      let detail;
      if (map.isMediaFire) {
        detail = getMediaFireDetails(map.mapLink);
      } else {
        detail = await getOsuDetails(map.mapLink);
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
  function getMediaFireDetails(mediaFireLink) {
    const match = mediaFireLink.match(
      /\/file\/[^\/]+\/([^-]+)-(.+)\.osz\/file/
    );
    if (match) {
      const artist = match[1].replace(/_/g, " ");
      const title = match[2].replace(/_/g, " ");
      return {
        artist,
        title,
        coverUrl: creator.pfp,
        creator: creator.name,
        beatmapLink: mediaFireLink,
        uid: uid,
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
  async function getOsuDetails(beatmapLink) {
    const beatmapSetId = extractBeatmapSetId(beatmapLink);

    if (!beatmapSetId) {
      return;
    }

    try {
      const response = await axios.get(
        `${process.env.REACT_APP_URL}/getBeatmapDetails`,
        {
          params: { beatmapSetId, uid, beatmapLink },
        }
      );
      return response.data;
    } catch (error) {
      return null;
    }
  }

  useEffect(() => {
    getMaps();
  }, []);
  useEffect(() => {
    getMapDetails();
  }, [maps]);

  return (
    <div className="w-screen h-screen bg-gradient-to-r from-black via-neutral-600 to-black flex flex-col items-center">
      <div className="h-2/12 w-10/12 py-5 text-white text-2xl flex justify-between">
        <div className="flex">
          <a
            href={creator.link}
            className="hover:bg-neutral-400 rounded-full p-1 duration-300"
          >
            <img
              src={creator.pfp}
              className="border-2 border-white h-32 w-32 rounded-full"
            />
          </a>
          <div className="content-center">
            <header className="mb-3 text-5xl">
              <a
                className="hover:bg-neutral-400 duration-300 rounded-lg"
                href={creator.link}
              >
                {creator.name}
              </a>
            </header>
            {/* <input
              value={search}
              placeholder="Search Beatmaps"
              className="bg-neutral-800 p-2 text-lg rounded-lg"
              onChange={handleChange}
            ></input> */}
          </div>
        </div>
        <div className="p-5 space-x-4 content-center">
          {/* {role === "admin" && (
            <>
              <button
                onClick={handleAddMap}
                className="bg-sky-500 text-white p-2 rounded-lg"
              >
                Add Map
              </button>
              <button
                onClick={handleLogout}
                className="bg-red-500 text-white p-2 rounded-lg"
              >
                Logout
              </button>
            </>
          )}
          {!user && (
            <Link
              className="text-xl hover:bg-sky-500 duration-300 rounded-lg"
              href="/login"
            >
              Login (Devs Only)
            </Link>
          )} */}
        </div>
      </div>
      <div className="w-10/12 py-5 text-white text-2xl overflow-auto grid grid-cols-1 md:grid-cols-2 gap-5">
        {maps.map(({ id, mapLink }, index) => (
          <Card
            details={mapDetails[id]}
            key={index}
            index={index}
            name={id}
            mapLink={mapLink}
          />
        ))}
      </div>
    </div>
  );
};

export default CreatorPage;
