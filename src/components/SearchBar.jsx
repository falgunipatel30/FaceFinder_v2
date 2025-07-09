import React, { useState } from "react";
import { FaTrash } from "react-icons/fa";
import { useRef } from "react";
import { ReactComponent as SearchIcon } from "../assets/search-svgrepo-com.svg";
import { ReactComponent as ImageSelectIcon } from "../assets/settings-svgrepo-com.svg";
import { searchImage } from "../services/operations/album";
import { useDispatch, useSelector } from "react-redux";

const SearchBar = ({ setItemData, resetAlbum, resetItemData, setLoading }) => {
  const fileInputRef = useRef(null);
  const [name, setName] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [isHovered, setIsHovered] = useState(false);
  const { token } = useSelector((state) => state.auth);
  const { itemData } = useSelector((state) => state.currentItem);
  // const dispatch = useDispatch();

  const dispatch = useDispatch();

  const handleSearch = async () => {
    //search by name functionality
    console.log("clicked");
  };

  const handleClick = () => {
    fileInputRef.current.click();
  };
  // handleSearch
  const handleFileChange = async (event) => {
    const file = event.target.files[0];

    if (file) {
      setSelectedFile(file);

      //hit the searchImage api
      dispatch(
        searchImage({ file: file, token, currImages: itemData, setLoading })
      );

      // Create a preview URL
      const reader = new FileReader();
      reader.onload = () => {
        setPreviewUrl(reader.result);
      };
      reader.readAsDataURL(file);
    } else {
      resetItemData();
    }
  };

  const handleDelete = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    resetAlbum();
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };
  return (
    <div className="w-full flex items-center justify-between px-8  rounded-2xl  h-16 bg-[#e7e7e7]">
      <div className="flex gap-3 items-center w-4/5">
        <SearchIcon
          onClick={handleSearch}
          width={20}
          height={20}
          className="z-[900] cursor-pointer"
        />
        <input
          value={name}
          onChange={(e) => {
            setName(e.target.value);
            if (e.target.value === "") {
              resetAlbum();
            } else {
              const filteredItems = itemData.filter((item) =>
                item.name.toLowerCase().includes(name.toLowerCase())
              );
              setItemData(filteredItems);
            }
          }}
          type="text"
          className=" w-[80%] z-[10]   h-full outline-none py-5 select-none bg-inherit placeholder-white rounded-2xl"
          // placeholder="Search by name..."
        />
      </div>
      <div className="flex gap-2 flex-row-reverse items-center">
        <button
          onClick={handleClick}
          className="gap-2 flex p-2 bg-inherit rounded"
        >
          <ImageSelectIcon width={25} height={25} />
        </button>
        <input
          type="file"
          ref={fileInputRef}
          className="hidden"
          accept="image/*"
          onChange={handleFileChange}
          capture="camera"
        />
        {/* Preview Image */}
        {previewUrl && (
          <div
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            className="relative"
          >
            <img
              src={previewUrl}
              alt="Preview"
              className=" h-10 rounded-full object-cover aspect-square "
            />

            {isHovered && (
              <button
                onClick={handleDelete}
                className="absolute hidden md:block top-0 right-0 bg-red-500 text-white rounded-full p-1 text-xs hover:bg-red-700 transition"
              >
                <FaTrash className="w-4 h-4" />
              </button>
            )}
            <button
              onClick={handleDelete}
              className="absolute block md:hidden top-0 right-0 bg-red-500 text-white rounded-full p-1 text-xs hover:bg-red-700 transition"
            >
              <FaTrash className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
      {/* </div> */}
    </div>
  );
};

export default SearchBar;
