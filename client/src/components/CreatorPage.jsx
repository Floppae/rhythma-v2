import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import axios from "axios";

const CreatorPage = () => {
  //useLocation is used to access the state passed from the Home component when we call handleClick
  const location = useLocation();
  const { creator } = location.state || {};
  const [maps, setMaps] = useState([]);
  const [mapDetails, setMapDetails] = useState({});

  async function getMaps() {
    try {
      const response = await axios.post("http://localhost:4000/maps", {
        uid: creator.uid,
      });
      const mapLinks = response.data.map((mapEntry) => mapEntry.map_link);
      const mapList = [];
      mapLinks.forEach((mapLink, index) => {
        const isMediaFire = mapLink.includes("mediafire.com");
        mapList.push({
          index,
          isMediaFire,
          mapLink,
        });
        //Each object in the mapList array has 2 properties, the mapLink and a boolean if link contains mediafire
        setMaps(mapList);
      });
      //allMaps is now an array with maplinks
      //Iterate through allMaps, if osu link call osu api, otherwise mediafire
    } catch (error) {
      console.error("Error fetching maps: ", error);
    }
  }

  async function getMapDetails() {
    const details = {};
    maps.forEach(async (map) => {
      let detail;
      if (map.isMediaFire) {
        console.log("media fire map hit");
        detail = getMediaFireDetails(map.mapLink);
      } else {
        console.log("osu map hit");
        detail = await getOsuDetails(map.mapLink);
      }
      if (detail) {
        details[map.index] = detail;
      }
    });
    setMapDetails(details);
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
      };
    }
    return null;
  }

  //Helper function for getBeatmapDetails to extract the beatmap Set ID
  function extractBeatmapSetId(beatmapLink) {
    if (!beatmapLink || typeof beatmapLink !== "string") {
      console.error("Invalid beatmap link:", beatmapLink);
      return null;
    }
    const match = beatmapLink.match(/beatmapsets\/(\d+)/);
    const beatmapSetId = match ? match[1] : null;
    //console.log("Extracted Beatmap Set ID:", beatmapSetId);
    return beatmapSetId;
  }

  //function to handle osu map details
  async function getOsuDetails(beatmapLink) {
    const beatmapSetId = extractBeatmapSetId(beatmapLink);
    console.log("beatmapsetID", beatmapSetId);

    if (!beatmapSetId) {
      console.error("Invalid beatmap link:", beatmapLink);
      return;
    }

    try {
      //console.log("Making API request...");
      const response = await axios.get("/getBeatmapDetails", {
        params: { beatmapSetId },
      });
      return response.data;
    } catch (error) {
      console.error("Error fetching beatmap details:", error);
      return null;
    }
  }

  useEffect(() => {
    getMaps();
  }, []);
  useEffect(() => {
    getMapDetails();
  }, []);

  console.log("maps", maps);
  console.log("map details", mapDetails);

  return (
    <div className="w-screen h-screen bg-neutral-900 flex flex-col items-center">
      <div className="h-2/12 w-10/12 py-5 text-white text-2xl flex justify-between">
        <div className="flex">
          <a
            href={creator.link}
            className="hover:bg-sky-400 rounded-full p-1 duration-300"
          >
            <img
              src={creator.pfp}
              className="border-2 border-sky-400 h-32 w-32 rounded-full"
            />
          </a>
          <div className="content-center">
            <header className="mb-3 text-5xl">
              <a
                className="hover:bg-sky-500 duration-300 rounded-lg"
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
      <div className="scrollbar w-10/12 py-5 text-white text-2xl overflow-y-auto grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* {filteredMaps.map(({ name, mapLink }, index) => (
          <Card
            details={mapDetails[name]}
            key={index}
            index={index}
            name={name}
            mapLink={mapLink}
            role={role}
            handleDeleteMap={handleDeleteMap}
          />
        ))} */}
        <p>All Maps Here</p>
      </div>
    </div>
  );
};

export default CreatorPage;
