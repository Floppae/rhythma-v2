import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { auth } from "../firebase";
import axios from "axios";
import Card from "./Card";
import { onAuthStateChanged, signOut } from "firebase/auth";
import Rhythma from "../../src/assets/Rhythma.png";

const CreatorEditPage = () => {
  const [uid, setUid] = useState(localStorage.getItem("uid"));
  const [maps, setMaps] = useState([]);
  const [mapDetails, setMapDetails] = useState({});
  //Initialize variables
  //uid is the id of The creator from firebase that we will use to index our pg database
  //maps will store map links
  //mapDetails will store the details of a map based on the corresponding index of maps

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUid(user.uid);
        localStorage.setItem("uid", user.uid);
        console.log("USER LOGGED IN", uid);
      } else {
        setUid(null);
        console.log("USER NOT LOGGED IN");
      }
    });
  });

  async function getMaps() {
    try {
      const response = await axios.post("http://localhost:4000/maps", {
        uid,
      });
      // console.log("UID", uid);
      const mapLinks = response.data.map((mapEntry) => mapEntry.map_link);
      // console.log(mapLinks);
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
      });
      setMaps(mapList);
      //Each object in the mapList array has 2 properties, the mapLink and a boolean if link contains mediafire
      // console.log(maps);
      //allMaps is now an array with maplinks
      //Iterate through allMaps, if osu link call osu api, otherwise mediafire
    } catch (error) {
      console.error("Error fetching maps: ", error);
    }
  }

  //Iterates through the maps list and propogates mapDetails (filtering through osu maps and mediafire maps)
  async function getMapDetails() {
    const details = {};

    const detailPromises = maps.map(async (map) => {
      let detail;
      if (map.isMediaFire) {
        // console.log("media fire map hit");
        detail = getMediaFireDetails(map.mapLink);
      } else {
        // console.log("osu map hit");
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
        coverUrl: null,
        creator: null,
        beatmapLink: mediaFireLink,
        uid: uid,
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
    // console.log("beatmapsetID", beatmapSetId);

    if (!beatmapSetId) {
      console.error("Invalid beatmap link:", beatmapLink);
      return;
    }

    try {
      //console.log("Making API request...");

      const response = await axios.get(
        "http://localhost:4000/getBeatmapDetails",
        {
          params: { beatmapSetId, uid, beatmapLink },
        }
      );
      return response.data;
    } catch (error) {
      console.error("Error fetching beatmap details:", error);
      return null;
    }
  }

  async function handleAddMap() {
    const mapLink = prompt("Enter a map link");
    if (!mapLink) {
      return;
    }
    if (
      mapLink.match(/beatmapsets\/(\d+)/) ||
      mapLink.match(/\/file\/[^\/]+\/([^-]+)-(.+)\.osz\/file/)
    ) {
      const uid = auth.currentUser?.uid;
      if (!uid) {
        console.error("User not authenticated");
        return;
      }
      try {
        axios
          .post("http://localhost:4000/add", { uid, mapLink })
          .then((response) => {
            console.log(response);
          });
      } catch (error) {
        console.error("Error adding map", error);
      }
      getMaps();
    } else {
      alert("Beatmap link invalid");
      return;
    }
  }

  async function handleLogout() {
    console.log("Signing user out:", auth.currentUser.uid);
    await signOut(auth);
    window.location.href = "/";
  }

  async function handleDeleteMap(mapLink) {
    //Query database to delete entry where uid and beatmap link = uid and beatmapLink
    //Quick check to see if a user is signed in
    const uid = auth.currentUser?.uid;
    if (!uid) {
      console.error("User not authenticated");
      return;
    }
    await axios.delete("http://localhost:4000/delete", {
      data: { uid, mapLink },
    });
    getMaps();
  }

  useEffect(() => {
    getMaps();
  }, []);
  useEffect(() => {
    getMapDetails();
  }, [maps]);

  // console.log("maps", maps);
  // console.log("map details", mapDetails);

  return (
    <div className="w-screen h-screen bg-gradient-to-r from-black via-neutral-600 to-black flex flex-col items-center">
      <div className="h-2/12 w-10/12 py-5 text-white text-2xl flex justify-between">
        <div className="flex">
          <img
            src={Rhythma}
            className="border-2 border-white h-32 w-32 rounded-full"
          />
          <div className="content-center">
            <header className="mb-3 text-5xl"></header>
            {/* <input
              value={search}
              placeholder="Search Beatmaps"
              className="bg-neutral-800 p-2 text-lg rounded-lg"
              onChange={handleChange}
            ></input> */}
          </div>
        </div>
        <div className="p-5 space-x-4 content-center">
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
        </div>
      </div>
      <div className="scrollbar w-10/12 py-5 text-white text-2xl overflow-y-auto grid grid-cols-1 md:grid-cols-2 gap-5">
        {maps.map(({ id, mapLink }, index) => (
          <Card
            details={mapDetails[id]}
            key={index}
            index={index}
            name={id}
            mapLink={mapLink}
            role="admin"
            handleDeleteMap={handleDeleteMap}
          />
        ))}
      </div>
    </div>
  );
};

export default CreatorEditPage;
