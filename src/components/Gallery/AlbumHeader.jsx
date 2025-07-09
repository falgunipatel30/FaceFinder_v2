import React, { useEffect, useState } from "react";
import { ReactComponent as ShareIcon } from "../../assets/share-ios-export-svgrepo-com.svg";
import { useDispatch, useSelector } from "react-redux";
import { useLocation, useNavigate } from "react-router";
import { fetchFolderBreadcrumb } from "../../services/operations/album";
import { setCurrentAlbum } from "../../slices/albumSlice";

const AlbumHeader = ({ currAlbum, setShareModal, type = "owner" }) => {
  const [breadcrumb, setBreadcrumb] = useState([]);
  const [album, setAlbum] = useState();
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { token } = useSelector((state) => state.auth);
  const { currentAlbum } = useSelector((state) => state.albums);
  const folderIds =
    location.pathname.match(/folder\/([^/]+)/g)?.map((s) => s.split("/")[1]) ||
    [];
  const currentFolderId =
    folderIds.length > 0 ? folderIds[folderIds.length - 1] : null;

  useEffect(() => {
    const getBreadcrumb = async () => {
      if (currentFolderId && currentFolderId !== "undefined") {
        try {
          const { crumbs, album } = await fetchFolderBreadcrumb({
            folderId: currentFolderId,
            token,
          });
          setAlbum(album);
          setBreadcrumb(crumbs);
        } catch (error) {
          console.error("Error fetching breadcrumb:", error);
        }
      } else {
        setBreadcrumb([]);
        setAlbum(currentAlbum);
      }
    };
    getBreadcrumb();
  }, [currentAlbum, currentFolderId, token]);

  const handleCrumbClick = (folderId, index) => {
    const newPath =
      `${type === "owner" && "/dashboard"}/album/${album._id}` +
      (index >= 0
        ? `/folder/` +
          breadcrumb
            .slice(0, index + 1)
            .map((b) => b.id)
            .join("/folder/")
        : "");
    navigate(newPath);
  };

  return (
    <div className="flex mt-8 md:mt-1 md:flex-row items-start md:items-center justify-between md:space-y-0 p-2">
      <div className="flex flex-col md:flex-row items-start md:items-baseline">
        <h1
          onClick={() => {
            type === "owner"
              ? navigate(`/dashboard/album/${album._id}`)
              : navigate(`/album/${album._id}`);
          }}
          className="text-2xl md:text-3xl font-bold cursor-pointer mr-0 md:mr-4  md:mb-0"
        >
          {album && album.name}
        </h1>
        <div className="flex flex-wrap items-center text-sm md:text-base">
          {breadcrumb.map((crumb, index) => (
            <div key={crumb.id} className="flex items-center">
              {index > 0 && <span className="mx-1 text-gray-500">/</span>}
              <span
                className={`cursor-pointer ${
                  index === breadcrumb.length - 1
                    ? "text-black font-bold"
                    : "text-gray-600 hover:text-[#855aff]"
                }`}
                onClick={() => handleCrumbClick(crumb._id, index)}
              >
                {crumb.name}
              </span>
            </div>
          ))}
        </div>
      </div>
      <div
        onClick={() => setShareModal(true)}
        className="bg-[#855aff] rounded-xl cursor-pointer self-start md:self-auto"
      >
        <div className="px-3 py-2 flex gap-2 text-white font-semibold items-center">
          <ShareIcon width={20} height={20} />
          <p className="hidden md:block">Share Album</p>
        </div>
      </div>
    </div>
  );
};

export default AlbumHeader;
