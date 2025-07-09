import React, { useState, useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router";
import folder from "../assets/open-folder.png";
import { setCurrentAlbum } from "../slices/albumSlice";

const AllAlbums = () => {
  const { albums, pinnedAlbums } = useSelector((state) => state.albums);
  const [selectedAlbum, setSelectedAlbum] = useState(null);
  const albumListRef = useRef(null);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const clickTimer = useRef(null); // Timer to differentiate single and double-click

  // Function to handle single-click selection
  const handleSingleClick = (event, albumId) => {
    event.stopPropagation(); // Prevents event bubbling
    setSelectedAlbum(albumId);
  };

  // Function to handle double-click navigation
  const handleDoubleClick = (event, album) => {
    event.stopPropagation(); // Prevents event bubbling
    dispatch(setCurrentAlbum(album));
    console.log(album);
    navigate(`./album/${album._id}`);
  };

  // Function to differentiate between single and double-clicks
  const handleClick = (event, album) => {
    event.stopPropagation();

    if (clickTimer.current) {
      clearTimeout(clickTimer.current);
      clickTimer.current = null;
      handleDoubleClick(event, album); // If second click detected, treat as double click
    } else {
      clickTimer.current = setTimeout(() => {
        handleSingleClick(event, album);
        clickTimer.current = null;
      }, 250); // Wait 250ms to confirm single click
    }
  };

  // Handle clicks outside the album list
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        albumListRef.current &&
        !albumListRef.current.contains(event.target)
      ) {
        setSelectedAlbum(null); // Deselect when clicking outside
      }
    };

    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  return (
    <div className="h-screen justify-center md:py-10 md:pr-4 flex flex-col my-auto">
      <div className="bg-[#f5f5f5] border-2 rounded-2xl border-[#855aff] relative h-full py-5 px-20">
        <h1 className="my-8 text-4xl font-bold"> All Albums</h1>

        <ul
          ref={albumListRef}
          className="max-h-[65vh] md:max-h-[60vh] flex md:gap-8 gap-2 flex-wrap overflow-auto thin-scrollbar py-4 mb-5 px-15"
        >
          {albums &&
            pinnedAlbums &&
            [...pinnedAlbums, ...albums].map((album) => (
              <li
                key={album._id}
                className={`album-item max-h-40 w-32 cursor-pointer flex flex-col items-center justify-center border-2 rounded-md
                ${
                  selectedAlbum === album._id
                    ? "bg-blue-100 border-blue-500"
                    : "bg-transparent border-transparent"
                }
              `}
                onMouseDown={(e) => handleClick(e, album)}
              >
                <img
                  src={
                    album.images.length > 0
                      ? album.thumbnail
                        ? album.thumbnail
                        : folder
                      : folder
                  }
                  alt={folder}
                  className="w-full h-full p-2 rounded-xl"
                />
                <h3 className="text-center mt-2">{album.name}</h3>
              </li>
            ))}
        </ul>
      </div>
    </div>
  );
};

export default AllAlbums;
