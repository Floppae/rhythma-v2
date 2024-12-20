import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { auth } from "../firebase";
import axios from "axios";
import Card from "./Card";
import { onAuthStateChanged, signOut } from "firebase/auth";
import Rhythma from "../../src/assets/Rhythma.png";

const CreatorEditPage = () => {
  const [uid, setUid] = useState(null);
  const [maps, setMaps] = useState([]);
  const [mapDetails, setMapDetails] = useState({});
  const [loadingMaps, setLoadingMaps] = useState(true);
  const [loadingDetails, setLoadingDetails] = useState(true);
  const navigate = useNavigate();
  //Initialize variables
  //uid is the id of The creator from firebase that we will use to index our pg database
  //maps will store map links
  //mapDetails will store the details of a map based on the corresponding index of maps

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUid(user.uid);
        getMaps(user.uid);
      } else {
        setUid(null);
        navigate("/login"); // Redirect to login if not authenticated
      }
    });
    return () => unsubscribe();
  }, [navigate]);

  async function getMaps(uid) {
    try {
      const response = await axios.post(
        `${process.env.REACT_APP_API_URL}/maps`,
        {
          uid,
        }
      );
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
      });
      setMaps(mapList);
      //Each object in the mapList array has 2 properties, the mapLink and a boolean if link contains mediafire
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

  async function handleAddMap() {
    const mapLink = prompt("Enter a map link");
    if (!mapLink) {
      return;
    }

    if (
      mapLink.match(/beatmapsets\/(\d+)/) ||
      mapLink.match(/\/file\/[^\/]+\/([^-]+)-(.+)\.osz\/file/)
    ) {
      //Update state of maps instead of calling getMaps() and refetching all the maps just to add one
      //When we update maps, mapDetails will update because maps is a dependency
      setMaps((prevMaps) => [
        ...prevMaps,
        {
          id: prevMaps.length,
          isMediaFire: mapLink.includes("mediafire.com"),
          mapLink,
        },
      ]);
      syncMapWithServer(mapLink);
    } else {
      alert("Beatmap link invalid");
      return;
    }
  }

  async function syncMapWithServer(mapLink) {
    try {
      const idToken = await auth.currentUser.getIdToken();
      if (!idToken) {
        alert("User not authenticated");
        window.location.href = "/";
      }
      await axios.post(
        `${process.env.REACT_APP_API_URL}/add`,
        { mapLink },
        { headers: { Authorization: `Bearer ${idToken}` } }
      );
    } catch (error) {
      console.error("Error syncing map with database");
      alert("Map not added, send notice to developers");
    }
  }

  async function handleLogout() {
    await signOut(auth);
    window.location.href = "/";
  }

  async function handleDeleteMap(mapLink) {
    //Query database to delete entry where uid and beatmap link = uid and beatmapLink
    //Quick check to see if a user is signed in
    const idToken = await auth.currentUser.getIdToken();
    if (!idToken) {
      alert("User not authenticated");
      window.location.href = "/";
    }

    try {
      await axios.delete(`${process.env.REACT_APP_API_URL}/delete`, {
        headers: { Authorization: `Bearer ${idToken}` },
        data: { mapLink },
      });
      getMaps(uid);
    } catch (error) {}
  }

  useEffect(() => {
    try {
      getMaps(uid);
    } catch (error) {
      console.error("Error loading maps");
    } finally {
      //set the laoding state to true
      setLoadingMaps(false);
    }
  }, [uid]);
  useEffect(() => {
    try {
      getMapDetails();
    } catch (error) {
      console.error("Error loading map details");
    } finally {
      //set the laoding state to true
      setLoadingDetails(false);
    }
  }, [maps]);

  if (loadingMaps || loadingDetails) {
    //return the a loading screen if the loading state is set to true
    //Once loading is complete, the useEffects will toggle the loading state to false and we can render everything
    return (
      <div className="w-screen h-screen bg-gradient-to-r from-black via-neutral-600 to-black flex flex-col items-center">
        <h1>Loading...</h1>
      </div>
    );
  }

  return (
    <div className="w-screen h-screen bg-gradient-to-r from-black via-neutral-600 to-black flex flex-col items-center">
      <div className="h-2/12 w-10/12 py-5 text-white text-2xl flex justify-between">
        <div className="flex">
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
