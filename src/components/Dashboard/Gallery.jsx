import React, { useState, useEffect } from "react";
import PhotoGallery from "../Dashboard/PhotoGallery";
import ImageAdd from "./ImageAdd";
import {
  deleteAlbum,
  deleteFolder,
  getAlbum,
} from "../../services/operations/album";
import { useDispatch, useSelector } from "react-redux";
import BeatLoader from "react-spinners/ClipLoader";
import AlbumHeader from "../Gallery/AlbumHeader";
import ImageModal from "../Gallery/ImageModal";
import ShareBox from "../Gallery/ShareModal";
import { useLocation, useNavigate, useParams } from "react-router";
import { fetchItem } from "../../slices/currentItemSlice";

const Gallery = ({
  currAlbum,
  setCurrAlbum,
  setAlbum,
  album,
  loading,
  setLoading,
  type = "album",
  waterMarkModal,
}) => {
  const [addImageModal, setAddImageModal] = useState(false);
  const [currImage, setCurrImage] = useState();
  const [shareModal, setShareModal] = useState(false);
  const [shouldFetch, setShouldFetch] = useState(true);

  const { token } = useSelector((state) => state.auth);
  const { albumId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const url = `http:localhost:3000/album/${albumId}`;

  const dispatch = useDispatch();

  const folderIds = location.pathname
    .match(/folder\/([^/]+)/g)
    ?.map((s) => s.split("/")[1]);

  useEffect(() => {
    const folderId = folderIds
      ? folderIds.length > 0
        ? folderIds[folderIds.length - 1]
        : null
      : null;
    if (folderId) {
      dispatch(fetchItem({ folderId }));
    } else {
      dispatch(fetchItem({ albumId }));
    }
  }, [albumId, dispatch, folderIds]);

  const handleDeleteAlbum = () => {
    const folderId = folderIds
      ? folderIds.length > 0
        ? folderIds[folderIds.length - 1]
        : null
      : null;
    if (folderId) {
      dispatch(
        deleteFolder(
          { folderId: folderId, albumId: albumId, token: token },
          () => {
            const regex = /\/folder\/[^/]+/g;
            const matched = location.pathname.match(regex);

            let newPath = `/dashboard/album/${albumId}`;
            if (matched && matched.length > 1) {
              // Remove the last folder from path
              newPath += matched.slice(0, -1).join("");
            }

            navigate(newPath);
          }
        )
      );
    } else {
      dispatch(
        deleteAlbum({ albumId: albumId, token }, setLoading, setAlbum, navigate)
      );
    }
  };

  const onCloseShareModal = () => {
    setShareModal(false);
  };

  return (
    <div className="w-full min-h-screen flex flex-col p-4 md:p-6 lg:p-10">
      <div className="bg-[#f5f5f5] border-2 rounded-2xl border-[#855aff] relative flex-grow flex flex-col">
        {loading === "full" ? (
          <div className="flex-grow flex items-center justify-center">
            <BeatLoader color="#855aff" size={50} />
          </div>
        ) : (
          <div
            className={`flex flex-col w-full px-2 md:px-4 lg:px-6 ${
              addImageModal || currImage || shareModal || waterMarkModal
                ? "blur pointer-events-none"
                : ""
            }`}
          >
            <div className="mb-4">
              <AlbumHeader
                currAlbum={currAlbum}
                setShareModal={setShareModal}
              />
            </div>

            <div className="flex-grow overflow-auto">
              <PhotoGallery
                currAlbum={currAlbum}
                setCurrAlbum={setCurrAlbum}
                setLoading={setLoading}
                setAddImageModal={setAddImageModal}
                handleDeleteAlbum={handleDeleteAlbum}
                setCurrImage={setCurrImage}
                loading={loading}
              />
            </div>
          </div>
        )}

        {addImageModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
            <div className="w-full max-w-md bg-black rounded-2xl p-4 md:p-4">
              <ImageAdd
                setAddImageModal={setAddImageModal}
                currAlbum={currAlbum}
                setCurrAlbum={setCurrAlbum}
                // setLoading={setLoading}
                setShouldFetch={setShouldFetch}
              />
            </div>
          </div>
        )}

        {currImage && (
          <ImageModal item={currImage} onClose={() => setCurrImage(null)} />
        )}

        {shareModal && (
          <ShareBox url={url} onCloseShareModal={onCloseShareModal} />
        )}
      </div>
    </div>
  );
};

export default Gallery;
