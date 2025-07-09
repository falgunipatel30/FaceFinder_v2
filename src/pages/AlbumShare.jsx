import React from "react";
import { useEffect } from "react";
import { useLocation, useNavigate, useParams } from "react-router";
import { getAlbum } from "../services/operations/album";
import { useState } from "react";
import SearchBar from "../components/SearchBar";
import { useRef } from "react";
import ImageComponent from "../components/Gallery/ImageComponent";
import AlbumHeader from "../components/Gallery/AlbumHeader";
import ShareBox from "../components/Gallery/ShareModal";
import ImageModal from "../components/Gallery/ImageModal";

const AlbumShare = () => {
  const { id } = useParams();
  const [itemData, setItemData] = useState([]);
  const [album, setAlbum] = useState([]);
  const [folders, setFolders] = useState([]);

  const location = useLocation();
  const navigate = useNavigate();
  const folderIds = location.pathname
    .match(/folder\/([^/]+)/g)
    ?.map((s) => s.split("/")[1]);
  const folderId = folderIds
    ? folderIds.length > 0
      ? folderIds[folderIds.length - 1]
      : null
    : null;

  useEffect(() => {
    const fetchAlbum = async () => {
      // if (!id) return;
      try {
        console.log(id);
        const response = await getAlbum({ albumId: id, folderId });
        setAlbum(response);
        setItemData(response?.images);
        setFolders(response?.folders);

        console.log("after", response);
      } catch (error) {
        console.error(error);
      }
    };
    fetchAlbum();
  }, [id, folderId]);

  const [selectedFolder, setSelectedFolder] = useState(null);
  const [shareModal, setShareModal] = useState(false);
  const [currImage, setCurrImage] = useState(null);
  const folderContainerRef = useRef(null); // Reference to detect outside clicks

  const handleFolderClick = (folderId) => {
    if (selectedFolder === folderId) {
      // setItemData(folders.find((folder) => folder._id === folderId).images);
      // setSelectedFolder(null);
      // setFolders(folders.find((folder) => folder._id === folderId).folders);
      navigate(`${location.pathname}/folder/${folderId}`);
    } else {
      setSelectedFolder(folderId);
    }
  };

  // Click outside logic to remove selection
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        folderContainerRef.current &&
        !folderContainerRef.current.contains(event.target)
      ) {
        setSelectedFolder(null);
      }
    };

    document.addEventListener("click", handleClickOutside);
    return () => {
      document.removeEventListener("click", handleClickOutside);
    };
  }, []);

  const resetAlbum = () => {
    setItemData(album.images);
  };

  const resetItemData = () => {
    setItemData(album.images);
  };

  const onCloseShareModal = () => {
    setShareModal(false);
  };

  const onCloseImageModal = () => {
    setCurrImage(null);
  };

  return (
    <div className="md:w-[95%]  mx-auto ">
      <div
        className={`bg-[#f5f5f5]  border-2 rounded-2xl border-[#855aff] relative h-full py-5   flex flex-col mt-10 ${
          (shareModal || currImage) && "blur pointer-events-none"
        }`}
      >
        <div className="mt-5 w-full">
          <div className="w-full flex flex-col max-h-[80vh] px-10">
            <div>
              <AlbumHeader
                currAlbum={album}
                setShareModal={setShareModal}
                type="public"
              />
            </div>
            <div className="my-5">
              <SearchBar
                setItemData={setItemData}
                resetAlbum={resetAlbum}
                resetItemData={resetItemData}
                itemData={itemData}
                // searchByName={searchByName}
              />
            </div>
            <div className="mt-5">
              <div
                className={`max-h-[65vh] md:max-h- flex md:gap-4 gap-2 flex-wrap overflow-auto thin-scrollba py-4 mb-5 justify-center`}
              >
                {folders &&
                  folders.length > 0 &&
                  folders.map((folder) => (
                    <button
                      ref={folderContainerRef}
                      key={folder._id}
                      className={`p-2 w-36 h-44 flex flex-col items-center justify-center rounded-lg ${
                        selectedFolder === folder._id
                          ? "bg-blue-500 text-white"
                          : ""
                      }`}
                      onClick={(e) => {
                        e.stopPropagation(); // Prevent click from bubbling up
                        handleFolderClick(folder._id);
                      }}
                    >
                      <img
                        src={folder.thumbnail}
                        alt={folder.name}
                        className=""
                      />
                      <p>{folder.name}</p>
                    </button>
                  ))}
                {itemData &&
                  itemData.map((item, index) => (
                    <ImageComponent
                      key={index}
                      item={item}
                      setCurrImage={setCurrImage}
                      type="public"
                    />
                  ))}
              </div>
            </div>
          </div>
        </div>
      </div>
      {shareModal && (
        <ShareBox
          url={`http:localhost:3000/album/${album._id}`}
          onCloseShareModal={onCloseShareModal}
        />
      )}

      {currImage && <ImageModal item={currImage} onClose={onCloseImageModal} />}
    </div>
  );
};

export default AlbumShare;
