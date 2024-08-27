import React from "react";
import { useLocation } from "react-router-dom";

const CreatorPage = () => {
  //useLocation is used to access the state passed from the Home component when we call handleClick
  const location = useLocation();
  const { creator } = location.state || {};
  return (
    <div className="w-screen h-screen bg-neutral-900 flex flex-col items-center">
      <div className="h-2/12 w-10/12 py-5 text-white text-2xl flex justify-between">
        <div className="flex">
          <a
            href="https://linktr.ee/grizzlypng"
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
                href="https://grizzlypng.carrd.co/"
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
          <p>Show buttons based on role</p>
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
