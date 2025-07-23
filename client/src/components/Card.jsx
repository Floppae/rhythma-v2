import React from "react";
import Rhythma from "../assets/Rhythma.png";

const Card = React.memo((props) => {
  const decodedTitle =
    props.details?.title &&
    decodeURIComponent(decodeURIComponent(props.details.title));
  return (
    <div
      key={props.index}
      className="w-full py-5 flex justify-between mb-10 bg-gradient-to-br from-stone-900 via-stone-800 to-stone-700 rounded-lg h-32 content-center items-center overflow-hidden shadow-[rgba(0,0,15,0.5)_0px_5px_25px_5px]"
    >
      {props.details && (
        <>
          <div className="flex-none w-32 h-32 rounded-lg overflow-hidden">
            {props.details.coverUrl && (
              <img
                src={props.details.coverUrl || Rhythma}
                alt={`${props.details.title} cover`}
                className="rounded-lg h-32 w-32 object-cover"
                onError={(e) => (e.target.src = Rhythma)}
              />
            )}
          </div>
          <div className="h-full ml-5 text-center">
            <a
              href={props.mapLink}
              className="text-2xl hover:bg-neutral-400 duration-300 rounded-lg"
            >
              {decodedTitle}
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
                onClick={() => props.handleDeleteMap(props.mapLink)}
                className="bg-red-500 rounded-lg h-32 w-32"
              >
                Delete
              </button>
            )}
          </div>
        </>
      )}
    </div>
  );
});
export default Card;
