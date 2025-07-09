import React, { useState } from "react";
import { ReactComponent as PinIcon } from "../assets/pin-svgrepo-com.svg";
import { useNavigate } from "react-router";
import { ReactComponent as UnpinIcon } from "../assets/unpin-svgrepo-com.svg";

const AlbumMenu = ({
  album,
  handlePin,
  handleUnpin,
  type,
  mobileFullScreen,
  toggleMobileMenu,
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const navigate = useNavigate();

  const handleAlbumClick = () => {
    if (mobileFullScreen) {
      toggleMobileMenu();
    }
    navigate(`/dashboard/album/${album._id}`);
  };

  const handlePinAction = (e, action) => {
    e.stopPropagation();
    action(album);
  };

  return (
    <div
      onClick={handleAlbumClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`
        w-full 
        px-2 
        
        flex 
        items-center 
        justify-between 
        text-white 
        hover:bg-[#372b5b] 
        transition 
        duration-200 
        rounded-xl 
        cursor-pointer 
        group
        relative
      `}
    >
      {/* Album Name */}
      <span className="text-base sm:text-lg md:text-xl truncate max-w-[80%]">
        {album.name}
      </span>

      {/* Pin/Unpin Action */}
      <div
        className={`
          transition-opacity 
          duration-300 
          ${isHovered ? "opacity-100" : "opacity-0 group-hover:opacity-100"}
        `}
      >
        {type === "unpinned" ? (
          <PinIcon
            onClick={(e) => handlePinAction(e, handlePin)}
            width={30}
            height={30}
            className="
              self-center 
              hover:bg-[#855aff] 
              rounded-full 
              p-1 
              transition 
              duration-200
            "
          />
        ) : (
          <UnpinIcon
            onClick={(e) => handlePinAction(e, handleUnpin)}
            width={30}
            height={30}
            className="
              self-center 
              hover:bg-[rgb(193,176,239)] 
              rounded-full 
              p-1 
              transition 
              duration-200
            "
          />
        )}
      </div>
    </div>
  );
};

export default AlbumMenu;
