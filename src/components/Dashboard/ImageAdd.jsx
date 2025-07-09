import React, { useEffect, useState } from "react";
import ImageUpload from "../ImageUpload";
import { addNewImages } from "../../services/operations/album";
import { useDispatch, useSelector } from "react-redux";
import { IoMdClose } from "react-icons/io";
import { useLocation, useParams } from "react-router";
import BeatLoader from "react-spinners/ClipLoader";

const ImageAdd = ({
  setAddImageModal,
  currAlbum,
  setCurrAlbum,
  // setLoading,
  setShouldFetch,
}) => {
  const [files, setFiles] = useState([]);
  const [previewFiles, setPreviewFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const { token } = useSelector((state) => state.auth);
  const { currentAlbum } = useSelector((state) => state.albums);
  const dispatch = useDispatch();
  const location = useLocation();
  const { albumId } = useParams();
  const folderIds =
    location.pathname.match(/folder\/([^/]+)/g)?.map((s) => s.split("/")[1]) ||
    [];
  const folderId = folderIds
    ? folderIds.length > 0
      ? folderIds[folderIds.length - 1]
      : null
    : null;

  const handleDelete = (index) => {
    //remove the file from files
    setFiles((prevFiles) => {
      const newFiles = [...prevFiles];

      // Clean up the object URL if it exists
      const fileToRemove = newFiles[index];
      if (fileToRemove.previewUrl) {
        URL.revokeObjectURL(fileToRemove.previewUrl);
      }

      // Remove the file from the array
      newFiles.splice(index, 1);

      return newFiles;
    });
  };

  const handleUpload = () => {
    try {
      console.log("a id", albumId, "folderId : ", folderId);
      dispatch(
        addNewImages(
          { albumId: albumId, files, folderId: folderId },
          token,
          setLoading,
          setShouldFetch
        )
      );
      setAddImageModal(false);
    } catch (error) {
      console.error("Error uploading images:", error);
    }
  };

  return (
    <div className="flex flex-col gap-2  bg-black rounded-2xl py-10 md:px-10 px-5">
      <div className="flex justify-between items-end mb-5 w-full mx-auto">
        <h1 className="font-semibold text-4xl text-white">Add More Images</h1>
        <div className="rounded-full bg-red-500 h-8 w-8">
          <IoMdClose
            onClick={() => setAddImageModal(false)}
            className="hover:cursor-pointer text-white"
            size={30}
            fontWeight={1000}
          />
        </div>
      </div>
      <ImageUpload
        setFiles={setFiles}
        className="mb-10 h-40"
        setLoading={setLoading}
      />
      {files && loading ? (
        <BeatLoader color="white" />
      ) : (
        files.length > 0 && (
          <ul className="my-5 w-full mx-auto flex flex-wrap thin-scrollbar items-center max-h-[40vh] gap-3 overflow-y-scroll">
            {/* {previewFiles.length > 0 &&
            previewFiles.map((file, index) => (
              <li key={index}>
                {file.preview ? (
                  <img
                    src={file.preview}
                    alt={file.name}
                    style={{ width: "50px", height: "auto", zIndex: "1000" }}
                  />
                ) : (
                  <p>No preview available</p>
                )}
              </li>
            ))} */}
            {files.map((file, index) => (
              <div
                key={index}
                style={{
                  position: "relative",
                  // width: "200px",
                  border: "1px solid #ddd",
                  borderRadius: "8px",
                  overflow: "auto",
                }}
              >
                {/* Delete Button */}
                <button
                  onClick={() => handleDelete(index)}
                  style={{
                    position: "absolute",
                    top: "5px",
                    right: "5px",
                    background: "rgba(0,0,0,0.6)",
                    color: "#fff",
                    border: "none",
                    borderRadius: "50%",
                    width: "24px",
                    height: "24px",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "14px",
                  }}
                >
                  ✕
                </button>

                {/* Preview */}
                {file.previewUrl ? (
                  <img
                    src={file.previewUrl}
                    alt={file.name}
                    style={{
                      width: "100px",
                      height: "auto",
                      // display: "block",
                    }}
                  />
                ) : (
                  <div style={{ padding: "10px", color: "white" }}>
                    <p>{file.name}</p>
                    <p>{file.previewUrl}</p>
                  </div>
                )}
              </div>
            ))}
          </ul>
        )
      )}
      <div className="flex gap-3 w-full mx-auto  mt-5 md:px-5 bg-[#855aff] text-start md:py-4 py-2 md:rounded-2xl rounded-lg">
        <button
          onClick={handleUpload}
          className="px-3 text-start text-white font-semibold w-full text-xl"
        >
          Upload Now
        </button>
      </div>
    </div>
  );
};

export default ImageAdd;
