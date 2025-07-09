import React from "react";
import notFoundImage from "../../assets/istockphoto-1409329028-1024x1024.jpg";
import { ReactComponent as TickIcon } from "../../assets/tick-svgrepo-com.svg";

const ImageComponent = ({
  index,
  selectionMode = false,
  handleImageSelect,
  item,
  selectedImages,
  editImages,
  setEditImages,
  setCurrImage,
  type = "owner",
}) => {
  return (
    <div
      className={`image-wrapper group relative aspect-square flex items-center justify-center rounded-lg ${
        selectionMode && selectedImages.includes(item)
          ? "border-2 border-[#e44650]"
          : ""
      }`}
      data-index={index}
      onClick={() =>
        type === "owner" && selectionMode && handleImageSelect(item)
      }
    >
      <img
        src={item.thumbnail}
        alt={item.name}
        loading="lazy"
        className={`w-full h-full overflow-hidden rounded-2xl object-cover select-none cursor-pointer ${
          selectionMode ? "cursor-pointer" : ""
        } ${
          editImages && editImages.includes(item) && "border-4 border-[#28a745]"
        }`}
        onError={(e) => {
          e.target.onerror = null;
          e.target.src = notFoundImage;
        }}
        onClick={() => setCurrImage(item)}
      />

      {/* Selection indicator */}
      {selectionMode &&
        (selectedImages.includes(item) ? (
          <div className="absolute top-2 right-2 bg-[#e44650] text-white rounded-full w-6 h-6 flex items-center justify-center text-xs">
            ✓
          </div>
        ) : (
          <div className="absolute top-2 right-2 bg-white border-2 border-[#e44650] rounded-full w-6 h-6"></div>
        ))}

      {/* Hover checkbox */}
      {type === "owner" && !selectionMode && (
        <div className="absolute top-2 right-2 bg-white bg-opacity-50 opacity-0 group-hover:opacity-100 flex transition-opacity duration-300">
          <label className="cursor-pointer">
            <input
              value={editImages.includes(item)}
              onChange={() => {
                setEditImages((prevSelected) => {
                  if (prevSelected.includes(item)) {
                    return prevSelected.filter(
                      (image) => image.url !== item.url
                    );
                  } else {
                    return [...prevSelected, item];
                  }
                });
              }}
              type="checkbox"
              className="hidden peer"
            />
            <div
              className={`w-6 h-6 border-2 border-[#e44650] rounded flex items-center justify-center ${
                editImages && editImages.includes(item) && "bg-[#e44650]"
              } peer-checked:border-[#e44650] transition-all duration-300`}
            >
              <TickIcon
                className="w-4 h-4 text-white opacity-0 peer-checked:opacity-100 transition-opacity duration-200"
                size={5}
              />
            </div>
          </label>
        </div>
      )}
    </div>
  );
};

export default ImageComponent;
