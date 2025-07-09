import * as React from "react";
import {
  createFolder,
  deleteImage,
  ratioChange,
} from "../../services/operations/album";
import { useDispatch, useSelector } from "react-redux";
import { ReactComponent as BinIcon } from "../../assets/bin-cancel-close-delete-garbage-remove-svgrepo-com.svg";
import { ReactComponent as AddIcon } from "../../assets/add-svgrepo-com.svg";
import { useState, useEffect } from "react";
import SearchBar from "../SearchBar";
import ImageComponent from "../Gallery/ImageComponent";
import {
  FaBars,
  FaChevronDown,
  FaChevronUp,
  FaDownload,
  FaEdit,
  FaFolder,
  FaTrash,
} from "react-icons/fa";
import { useRef } from "react";
import { fetchItem } from "../../slices/currentItemSlice";
import { useLocation, useNavigate, useParams } from "react-router";
import NProgress from "nprogress";
import BeatLoader from "react-spinners/ClipLoader";

export default function StandardImageList({
  currAlbum,
  setCurrAlbum,
  setLoading,
  setAddImageModal,
  handleDeleteAlbum,
  setCurrImage,
  loading,
}) {
  const { token } = useSelector((state) => state.auth);
  const [sortOption, setSortOption] = useState("newest");
  const [selectionMode, setSelectionMode] = useState(false);
  const [selectedImages, setSelectedImages] = React.useState([]);
  const [editImages, setEditImages] = useState([]);
  const [editRatioModal, setEditRatioModal] = useState(false);
  const [createFolderModal, setCreateFolderModal] = useState(false);
  const [ratio, setRatio] = useState(null);
  const [folderName, setFolderName] = useState("");
  const dispatch = useDispatch();
  const [selectedFolder, setSelectedFolder] = useState(null);
  const folderContainerRef = useRef(null);

  const { itemData, folders } = useSelector((state) => state.currentItem);
  const location = useLocation();
  const navigate = useNavigate();
  const handleFolderClick = (folderId) => {
    const isMobile = window.innerWidth <= 768;

    if (isMobile) {
      navigate(`${location.pathname}/folder/${folderId}`);
      setSelectedFolder(null);
    } else {
      if (selectedFolder === folderId) {
        // setCurrAlbum(folders.find((folder) => folder._id === folderId));
        navigate(`${location.pathname}/folder/${folderId}`);
        setSelectedFolder(null);
      } else {
        setSelectedFolder(folderId);
      }
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

  const { albumId } = useParams();
  const folderIds = location.pathname
    .match(/folder\/([^/]+)/g)
    ?.map((s) => s.split("/")[1]);
  const folderId = folderIds
    ? folderIds.length > 0
      ? folderIds[folderIds.length - 1]
      : null
    : null;

  useEffect(() => {
    if (folderId) {
      dispatch(fetchItem({ folderId }));
    } else {
      dispatch(fetchItem({ albumId }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  useEffect(() => {
    setEditImages([]);
  }, [itemData, folderId, albumId, folders]);
  // const [loading, setLoading] = useState(false);

  const handleToggleSelection = () => {
    if (selectionMode) {
      setSelectionMode(false);
      setSelectedImages([]);
    } else {
      setSelectionMode(true);
      setSelectedImages([]);
    }
    setEditImages([]);
  };
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // const handleSortChange = async (sortType) => {
  //   if (sortType === "clickedAt") {
  //     // Call the API to get images sorted by clickedAt
  //     const sortedImages = await fetchImagesSortedByClickedAt();
  //     dispatch(setItemData(sortedImages)); // Update state with sorted images
  //   } else {
  //     // Implement other sorting logic like "newest", "oldest", etc.
  //     const sortedImages = sortImages(sortType);
  //     setItemData(sortedImages);
  //   }
  // };

  // const fetchImagesSortedByClickedAt = async () => {
  //   try {
  //     const response = await axios.get(
  //       "http://localhost:4000/api/album/sort-by-clickedAt",
  //       {
  //         headers: {
  //           Authorization: `Bearer ${token}`, // Assuming you need a token for authorization
  //         },
  //       }
  //     );
  //     return response.data.sortedImages; // Assuming the response has sorted images
  //   } catch (error) {
  //     console.error("Error fetching images sorted by clickedAt:", error);
  //     return []; // Return an empty array on error
  //   }
  // };

  // Function to handle other sorting options like newest, oldest, A-Z, Z-A
  // const sortImages = (sortType) => {
  //   if (sortType === "newest") {
  //     return [...itemData].sort(
  //       (a, b) => new Date(b.addedAt) - new Date(a.addedAt)
  //     );
  //   }
  //   if (sortType === "oldest") {
  //     return [...itemData].sort(
  //       (a, b) => new Date(a.addedAt) - new Date(b.addedAt)
  //     );
  //   }
  //   if (sortType === "az") {
  //     return [...itemData].sort((a, b) => a.name.localeCompare(b.name));
  //   }
  //   if (sortType === "za") {
  //     return [...itemData].sort((a, b) => b.name.localeCompare(a.name));
  //   }
  //   return itemData; // Default return if no matching sort type
  // };

  // Run this once when the component mounts to fetch the initial data
  // useEffect(() => {
  //   if (sortOption === "clickedAt") {
  //     // If the default sort is by clickedAt, trigger the API call
  //     handleSortChange("clickedAt");
  //   } else {
  //     const initialSortedImages = sortImages(sortOption);
  //     setItemData(initialSortedImages);
  //   }
  // }, [sortOption]);

  const sortedImages = [...(itemData || [])].sort((a, b) => {
    switch (sortOption) {
      case "newest":
        return new Date(b.addedAt) - new Date(a.addedAt);
      case "oldest":
        return new Date(a.addedAt) - new Date(b.addedAt);
      case "az":
        return a.name.localeCompare(b.name);
      case "za":
        return b.name.localeCompare(a.name);
      case "clickedAt Newest":
        // Handle sorting by clickedAt, checking for null values
        const clickedAtA = a.clickedAt ? new Date(a.clickedAt) : new Date(0); // Default to oldest if null
        const clickedAtB = b.clickedAt ? new Date(b.clickedAt) : new Date(0); // Default to oldest if null
        return clickedAtB - clickedAtA; // Newest First by clickedAt

      case "clickedAt Oldest":
        // Handle sorting by clickedAt, checking for null values
        const clickedAtAO = a.clickedAt ? new Date(a.clickedAt) : new Date(0); // Default to oldest if null
        const clickedAtBO = b.clickedAt ? new Date(b.clickedAt) : new Date(0); // Default to oldest if null
        return clickedAtAO - clickedAtBO; // Oldest First by clickedAt
      default:
        return 0;
    }
  });

  const resetAlbum = () => {
    // setItemData(currAlbum?.images);
    // setSelectedImages([]);
    // setSelectionMode(false);
    if (folderId) {
      dispatch(fetchItem({ folderId }));
    } else {
      dispatch(fetchItem({ albumId }));
    }
  };

  const handleImageSelect = (imageUrl) => {
    if (selectedImages.includes(imageUrl)) {
      setSelectedImages(selectedImages.filter((url) => url !== imageUrl));
    } else {
      setSelectedImages([...selectedImages, imageUrl]);
    }

    console.log(selectedImages);
  };

  const handleEditRatio = async () => {
    dispatch(
      ratioChange(
        {
          images: editImages,
          token: token,
          ratio: ratio,
          albumId: albumId,
          folderId: folderId,
        },
        setCurrAlbum
      )
    );
    setEditImages([]);
    setSelectedImages([]);
    setRatio();
    setSelectionMode(false);
  };

  const handleDownloadImages = async () => {
    if (editImages.length === 0) {
      alert("No images selected to download.");
      return;
    }
    NProgress.start();
    const worker = new Worker("/zipWorker.js"); // Proper reference to the worker

    worker.postMessage({ files: editImages });

    worker.onmessage = (event) => {
      const { progress, zipContent } = event.data;

      if (progress !== undefined) {
        NProgress.set(progress / 100); // NProgress accepts a value between 0 and 1
      }

      if (zipContent) {
        // Make sure zipContent is a valid Blob
        if (zipContent instanceof Blob) {
          const downloadLink = document.createElement("a");
          downloadLink.href = URL.createObjectURL(zipContent);
          downloadLink.download = "images.zip"; // Name for the zip file
          document.body.appendChild(downloadLink);
          downloadLink.click();
          document.body.removeChild(downloadLink);

          NProgress.done();
        } else {
          console.error("zipContent is not a valid Blob");
        }
      } else {
        console.log(`Progress: ${progress}%`);
      }
    };

    worker.onerror = (error) => {
      console.error("Worker error:", error);
      NProgress.done();
    };

    NProgress.start();
  };

  const handleFolderCreate = async () => {
    const folderId = folderIds
      ? folderIds.length > 0
        ? folderIds[folderIds.length - 1]
        : null
      : null;
    dispatch(
      createFolder(
        {
          albumId: albumId,
          name: folderName,
          token: token,
          images: editImages,
          folderId: folderId,
        },
        setCurrAlbum,
        setEditImages
      )
    );
    setFolderName("");
    setCreateFolderModal(false);
    setEditImages([]);
  };

  const selectAll = () => {
    setSelectedImages(itemData.map((image) => image));
  };

  const deselectAll = () => {
    setSelectedImages([]);
  };

  const selectAllToEdit = () => {
    setEditImages(itemData);
  };

  const deselectAllToEdit = () => {
    setEditImages([]);
  };

  const handleDeleteSelected = () => {
    if (selectedImages.length === 0) {
      return;
    }

    dispatch(
      deleteImage(
        { ImageArray: selectedImages, albumId: albumId, folderId: folderId },
        token,
        setLoading,
        setCurrAlbum
      )
    );
  };

  const handleSelectRatio = (ratio) => {
    setRatio(ratio); // Trigger parent callback if needed
    setEditRatioModal(false); // Close dropdown
  };

  const resetItemData = () => {
    if (folderId) {
      dispatch(fetchItem({ folderId }));
    } else {
      dispatch(fetchItem({ albumId }));
    }
  };

  return (
    <div className="w-full flex flex-col max-h-[calc(100vh-10rem)] px-2">
      {/* Mobile Menu Toggle */}

      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-80 z-[1000] md:hidden ">
          <div className="bg-white w-3/4 h-full p-4 overflow-y-auto">
            <div className="absolute flex top-4 text-center items-center justify-center right-4 h-8 w-8 bg-white rounded-full ">
              <button
                onClick={() => setMobileMenuOpen(false)}
                className=" text-4xl "
              >
                ×
              </button>
            </div>
            <div className="flex flex-col gap-4 mt-10">
              <button
                onClick={handleToggleSelection}
                className="px-3 bg-[#ffc0c4] text-[#e44650] rounded-lg py-2 flex justify-center font-semibold items-center"
              >
                {selectionMode ? "Cancel" : "Remove"}
                <BinIcon width={20} height={20} className="ml-2" />
              </button>

              <button
                onClick={() => setAddImageModal(true)}
                className="bg-[#d5c3ff] text-[#855aff] px-3 rounded-lg py-2 flex justify-center font-semibold items-center"
              >
                Add
                <AddIcon width={20} height={20} className="ml-2" />
              </button>

              {/* Select All and Deselect All Buttons */}
              {selectionMode && (
                <div className="flex flex-col gap-2">
                  <button
                    onClick={selectAll}
                    className="px-3 py-1.5 bg-blue-50 text-blue-600 rounded-lg font-medium hover:bg-blue-100 transition-colors"
                  >
                    Select All
                  </button>
                  <button
                    onClick={deselectAll}
                    className="px-3 py-1.5 bg-blue-50 text-blue-600 rounded-lg font-medium hover:bg-blue-100 transition-colors"
                  >
                    Deselect All
                  </button>
                </div>
              )}

              {/* Ratio Editing Section */}
              {editImages.length > 0 && (
                <div className="flex flex-col gap-2">
                  <div className="relative inline-block text-left w-full">
                    <button
                      onClick={() => setEditRatioModal((prev) => !prev)}
                      className="flex items-center justify-between gap-3 px-4 py-2 bg-green-50 text-green-600 font-medium rounded-lg hover:bg-green-100 transition-colors w-full"
                    >
                      <FaEdit className="w-4 h-4 mr-2" />
                      <span>{ratio ? `${ratio}` : "Edit Ratio"}</span>
                      {editRatioModal ? (
                        <FaChevronUp className="w-4 h-4 ml-2" />
                      ) : (
                        <FaChevronDown className="w-4 h-4 ml-2" />
                      )}
                    </button>
                    {editRatioModal && (
                      <ul className="mt-2 w-full bg-white border border-gray-200 rounded-lg shadow-lg">
                        <li
                          className="block px-4 py-2 text-gray-800 hover:bg-gray-100 cursor-pointer"
                          onClick={() => handleSelectRatio("1:1")}
                        >
                          1:1
                        </li>
                        <li
                          className="block px-4 py-2 text-gray-800 hover:bg-gray-100 cursor-pointer"
                          onClick={() => handleSelectRatio("4:3")}
                        >
                          4:3
                        </li>
                        <li
                          className="block px-4 py-2 text-gray-800 hover:bg-gray-100 cursor-pointer"
                          onClick={() => handleSelectRatio("16:9")}
                        >
                          16:9
                        </li>
                      </ul>
                    )}
                  </div>
                  {editImages.length > 0 && ratio && (
                    <button
                      onClick={handleEditRatio}
                      className="px-4 py-2 w-full bg-green-500 text-white font-medium rounded-lg hover:bg-green-600 transition-colors flex items-center gap-2"
                    >
                      <FaEdit className="w-4 h-4" />
                      Change
                    </button>
                  )}
                </div>
              )}

              {/* Create Folder Section */}
              {editImages.length > 0 && (
                <div className="relative inline-block text-left w-full">
                  <button
                    onClick={() => setCreateFolderModal((prev) => !prev)}
                    className="flex w-full items-center justify-center gap-3 px-4 py-2 bg-blue-50 text-blue-600 font-medium rounded-lg hover:bg-blue-100 transition-colors"
                  >
                    <FaFolder className="w-4 h-4" />
                    Create Folder
                  </button>
                  {createFolderModal && (
                    <div className="mt-2 w-full bg-white border border-gray-200 rounded-lg shadow-lg min-w-fit">
                      <form className="flex flex-col gap-2 justify-center py-5 items-center px-4 text-gray-800 bg-gray-100 ">
                        <input
                          value={folderName}
                          onChange={(e) => setFolderName(e.target.value)}
                          type="text"
                          className="outline-none px-3 py-2 rounded-lg w-full"
                          placeholder="Folder name"
                        />
                        <button
                          onClick={handleFolderCreate}
                          type="submit"
                          className="rounded-lg px-3 py-2 bg-blue-500 text-white w-full"
                        >
                          Add
                        </button>
                      </form>
                    </div>
                  )}
                </div>
              )}

              {/* Select All and Deselect All for Editing */}
              {editImages.length > 0 && (
                <div className="flex flex-col gap-2">
                  <button
                    onClick={selectAllToEdit}
                    className="px-3 py-1.5 bg-blue-50 text-blue-600 rounded-lg font-medium hover:bg-blue-100 transition-colors"
                  >
                    Select All to Edit
                  </button>
                  <button
                    onClick={deselectAllToEdit}
                    className="px-3 py-1.5 bg-blue-50 text-blue-600 rounded-lg font-medium hover:bg-blue-100 transition-colors"
                  >
                    Deselect All to Edit
                  </button>
                </div>
              )}

              {/* Download Button */}
              {editImages && editImages.length > 0 && (
                <button
                  onClick={handleDownloadImages}
                  className="gap-3 px-4 py-2 bg-blue-500 text-white font-medium rounded-lg shadow-sm hover:bg-blue-700 focus:outline-none"
                >
                  Download
                </button>
              )}

              {/* Sorting Dropdown */}
              <select
                value={sortOption}
                onChange={(e) => setSortOption(e.target.value)}
                className="px-3 py-2 rounded-lg border text-sm font-semibold w-full"
              >
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
                <option value="az">A → Z</option>
                <option value="za">Z → A</option>
                <option value="clickedAt">Sort by Date Clicked</option>
              </select>

              {/* Delete Album/Folder Button */}
              <button
                onClick={() => handleDeleteAlbum({ albumId, folderId })}
                className="bg-red-400 flex items-center justify-center gap-1 py-2 rounded-lg text-white font-semibold"
              >
                Delete {folderId ? "Folder" : "Album"}
                <BinIcon width={20} height={20} />
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="py-5 md:block">
        <SearchBar
          resetAlbum={resetAlbum}
          resetItemData={resetItemData}
          itemData={itemData}
          setLoading={setLoading}
        />
      </div>

      {/* Desktop Controls */}

      <div className="md:hidden flex gap-2 items-center my-4">
        <h2 className="text-xl font-bold text-[#855aff]">
          Image Options -{">"}{" "}
        </h2>
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="p-2 bg-gray-200 rounded-lg"
        >
          <FaBars />
        </button>
      </div>

      <div className="md:flex hidden md:justify-between gap-3 mb-3">
        <div className="flex gap-3 flex-wrap items-center">
          {/* Remove Button */}
          <button
            onClick={handleToggleSelection}
            className="px-3 py-1.5 bg-[#ffc0c4] text-red-600 rounded-lg font-medium flex items-center gap-2 hover:bg-red-100 transition-colors"
          >
            <FaTrash className="w-4 h-4" />
            {selectionMode ? "Cancel" : "Remove"}
          </button>

          {/* Add Image Button */}
          <button
            onClick={() => setAddImageModal(true)}
            className="px-3 py-1.5 bg-[#d5c3ff] text-[#855aff] rounded-lg font-medium flex items-center gap-2 hover:bg-purple-100 transition-colors"
          >
            <AddIcon width={20} height={20} />
            Add
          </button>

          {/* Select/Deselect All Buttons */}
          {selectionMode && (
            <>
              <button
                onClick={selectAll}
                className="px-3 py-1.5 bg-blue-50 text-blue-600 rounded-lg font-medium hover:bg-blue-100 transition-colors"
              >
                Select All
              </button>
              <button
                onClick={deselectAll}
                className="px-3 py-1.5 bg-blue-50 text-blue-600 rounded-lg font-medium hover:bg-blue-100 transition-colors"
              >
                Deselect All
              </button>
            </>
          )}

          {/* Edit Ratio Section */}
          {editImages.length > 0 && (
            <div className="relative inline-block text-left">
              <button
                onClick={() => setEditRatioModal((prev) => !prev)}
                className="flex items-center justify-between gap-3 px-4 py-1.5 bg-green-50 text-green-600 font-medium rounded-lg hover:bg-green-100 transition-colors"
              >
                <FaEdit className="w-4 h-4 mr-2" />
                <span>{ratio ? `${ratio}` : "Edit Ratio"}</span>
                {editRatioModal ? (
                  <FaChevronUp className="w-4 h-4 ml-2" />
                ) : (
                  <FaChevronDown className="w-4 h-4 ml-2" />
                )}
              </button>
              {editRatioModal && (
                <ul className="absolute z-50 mt-2 w-40 bg-white border border-gray-200 rounded-lg shadow-lg">
                  {["1:1", "4:3", "16:9"].map((ratioOption) => (
                    <li
                      key={ratioOption}
                      className="block px-4 py-2 text-gray-800 hover:bg-gray-100 cursor-pointer"
                      onClick={() => handleSelectRatio(ratioOption)}
                    >
                      {ratioOption}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}

          {/* Change Ratio Button */}
          {editImages.length > 0 && ratio && (
            <button
              onClick={handleEditRatio}
              className="px-4 py-1.5 bg-green-500 text-white font-medium rounded-lg hover:bg-green-600 transition-colors flex items-center gap-2"
            >
              <FaEdit className="w-4 h-4" />
              Change
            </button>
          )}

          {/* Create Folder Section */}
          {editImages.length > 0 && (
            <div className="relative inline-block text-left">
              <button
                onClick={() => setCreateFolderModal((prev) => !prev)}
                className="flex items-center justify-center gap-3 px-4 py-1.5 bg-blue-50 text-blue-600 font-medium rounded-lg hover:bg-blue-100 transition-colors"
              >
                <FaFolder className="w-4 h-4" />
                Create Folder
              </button>
              {createFolderModal && (
                <div className="absolute z-50 mt-2 w-40 bg-white border border-gray-200 rounded-lg shadow-lg min-w-fit">
                  <form className="flex flex-col gap-2 justify-center py-5 items-center px-4 text-gray-800 bg-gray-100">
                    <input
                      value={folderName}
                      onChange={(e) => setFolderName(e.target.value)}
                      type="text"
                      className="outline-none px-3 py-2 rounded-lg w-full"
                      placeholder="Folder name"
                    />
                    <button
                      onClick={handleFolderCreate}
                      type="submit"
                      className="rounded-lg px-3 py-2 bg-blue-500 text-white w-full hover:bg-blue-600 transition-colors"
                    >
                      Add
                    </button>
                  </form>
                </div>
              )}
            </div>
          )}

          {/* Select/Deselect All for Editing */}
          {editImages.length > 0 && (
            <>
              <button
                onClick={selectAllToEdit}
                className="px-3 py-1.5 bg-indigo-50 text-indigo-600 rounded-lg font-medium hover:bg-indigo-100 transition-colors"
              >
                Select All to Edit
              </button>
              <button
                onClick={deselectAllToEdit}
                className="px-3 py-1.5 bg-indigo-50 text-indigo-600 rounded-lg font-medium hover:bg-indigo-100 transition-colors"
              >
                Deselect All to Edit
              </button>
            </>
          )}

          {/* Download Button */}
          {editImages && editImages.length > 0 && (
            <button
              onClick={handleDownloadImages}
              className="px-4 py-1.5 bg-blue-500 text-white font-medium rounded-lg hover:bg-blue-600 transition-colors flex items-center gap-2"
            >
              <FaDownload className="w-4 h-4" />
              Download
            </button>
          )}
        </div>

        <div className="flex md:justify-between gap-3 items-center">
          {/* Sorting Dropdown */}
          <select
            value={sortOption}
            onChange={(e) => setSortOption(e.target.value)}
            className="px-3 py-1.5 rounded-lg border text-sm font-medium text-gray-700 hover:border-gray-400 transition-colors"
          >
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
            <option value="az">A → Z</option>
            <option value="za">Z → A</option>
            <option value="clickedAt Newest">
              Sort by Date Clicked {`(newest)`}
            </option>
            <option value="clickedAt Oldest">
              Sort by Date Clicked {`(oldest)`}
            </option>
          </select>

          {/* Delete Album/Folder Button */}
          <button
            onClick={() => handleDeleteAlbum({ albumId, folderId })}
            className="bg-red-500 hidden md:flex items-center gap-2 py-1.5 px-4 rounded-lg text-white font-medium hover:bg-red-600 transition-colors"
          >
            <FaTrash className="w-4 h-4" />
            Delete {folderId ? "Folder" : "Album"}
          </button>
        </div>
      </div>

      {loading === "photos" ? (
        <div className="flex justify-center items-center min-h-[50vh] h-full">
          <BeatLoader color="#855aff" size={50} speedMultiplier={0.6} />
        </div>
      ) : (
        // {/* Responsive Grid */}
        <div
          className={`h-full grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2 overflow-auto thin-scrollbar py-4 mb-5`}
        >
          {folders &&
            folders.length > 0 &&
            folders.map((folder) => (
              <button
                ref={folderContainerRef}
                key={folder._id}
                className={`p-2 w-full aspect-square flex flex-col items-center justify-center rounded-lg ${
                  selectedFolder === folder._id ? "bg-blue-500 text-white" : ""
                }`}
                onClick={(e) => {
                  e.stopPropagation();
                  handleFolderClick(folder._id);
                }}
              >
                <img
                  src={folder.thumbnail}
                  alt={folder.name}
                  className="w-full h-full object-cover rounded-lg"
                />
                <p className="mt-2 text-sm truncate">{folder.name}</p>
              </button>
            ))}

          {sortedImages &&
            sortedImages.map((item, index) => (
              <ImageComponent
                key={index}
                selectedImages={selectedImages}
                selectionMode={selectionMode}
                handleImageSelect={handleImageSelect}
                item={item}
                editImages={editImages}
                setEditImages={setEditImages}
                setCurrImage={setCurrImage}
                type="owner"
              />
            ))}
        </div>
      )}

      {selectionMode && selectedImages.length > 0 && (
        <div className="fixed bottom-0 left-0 w-full bg-white p-4 shadow-lg md:static md:w-auto md:p-0 md:shadow-none">
          <button
            onClick={handleDeleteSelected}
            className="bg-[#e44650] text-white font-semibold py-2 px-4 rounded-lg w-full md:w-auto"
          >
            Delete {selectedImages.length} Selected
          </button>
        </div>
      )}
    </div>
  );
}
