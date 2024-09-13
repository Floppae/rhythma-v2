import React from "react";

function Card(props) {
  console.log("DETAILS", props.details);
  return (
    <div
      key={props.index}
      className="w-full py-5 flex justify-between mb-10 bg-neutral-800 rounded-lg h-32 content-center items-center overflow-hidden"
    >
      {props.details && (
        <>
          <div className="border-2 border-sky-500 flex-none w-32 h-32 rounded-lg overflow-hidden">
            {props.details.coverUrl && (
              <img
                src={props.details.coverUrl}
                alt={`${props.details.title} cover`}
                className="rounded-lg h-32 w-32 object-cover"
              />
            )}
          </div>
          <div className="h-full ml-5 text-center">
            <a
              href={props.mapLink}
              className="text-3xl hover:bg-sky-500 duration-300 rounded-lg"
            >
              {props.details.title}
            </a>
            <p className="text-sm">
              {props.details.artist}
              <br />
              Mapped By: {props.details.creator}
            </p>
          </div>

          <div>
            {props.role === "admin" && (
              <button
                onClick={() => props.handleDeleteMap(props.name)}
                className="bg-red-500 text-white p-2 rounded-lg"
              >
                Delete
              </button>
            )}
          </div>
        </>
      )}
    </div>
  );
}

export default Card;
