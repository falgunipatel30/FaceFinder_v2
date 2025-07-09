import { IoMdAdd } from "react-icons/io";
import { useDispatch, useSelector } from "react-redux";
import { logout } from "../../services/operations/auth";
import BeatLoader from "react-spinners/ClipLoader";
import { ReactComponent as ShareIcon } from "../../assets/share-arrow-svgrepo-com.svg";
import { ReactComponent as LogoutIcon } from "../../assets/logout-svgrepo-com.svg";
import { ReactComponent as PinIcon } from "../../assets/pin-svgrepo-com.svg";
//import { ReactComponent as CloseIcon } from "../../assets/close-svgrepo-com.svg";
import { ReactComponent as WatermarkIcon } from "../../assets/watermark-svgrepo-com.svg"; // Add a close icon
// Add a close icon
import AlbumMenu from "../AlbumMenu";
import { pinAlbum, unpinAlbum } from "../../services/operations/album";
import { useNavigate } from "react-router";
import { RxCross2 } from "react-icons/rx";

const SideMenu = ({
  setAddModal,
  setAlbum,
  loading,
  toggleMobileMenu,
  setLoading,
  setReferModa,
  setWaterMarkModal,
  mobileFullScreen = false, // New prop to differentiate mobile and desktop views
}) => {
  const dispatch = useDispatch();
  const { token } = useSelector((state) => state.auth);
  const { albums, pinnedAlbums } = useSelector((state) => state.albums);
  //const { albumId } = useParams();
  const navigate = useNavigate();

  const handlePin = (album) => {
    dispatch(pinAlbum({ albumId: album._id, token }));
  };

  const handleUnpin = (album) => {
    dispatch(unpinAlbum({ albumId: album._id, token }));
  };

  // Close mobile menu when an album is selected
  const handleAlbumSelect = () => {
    if (mobileFullScreen) {
      toggleMobileMenu();
    }
  };

  return (
    <div
      className={`${
        mobileFullScreen
          ? "fixed inset-0 z-50 w-full h-full bg-black text-white"
          : "fixed top-0 left-0 min-h-screen md:w-[calc(100vw-85%)] py-10 pl-4"
      }`}
    >
      {/* Close Button for Mobile View */}
      {mobileFullScreen && (
        <button
          onClick={toggleMobileMenu}
          className="
            absolute 
            top-4 
            right-4 
            z-[1000] 
            bg-white/10 
            hover:bg-white/20 
            p-2 
            rounded-full 
            transition-colors 
            duration-300
          "
        >
          <RxCross2 size={24} color="white" />
        </button>
      )}

      <div
        className={`
          flex flex-col 
          ${mobileFullScreen ? "h-full " : "min-h-[calc(100vh-5rem)]"}  
          py-10 px-5 gap-10 w-full 
          rounded-3xl bg-black text-white relative
        `}
      >
        <div
          className={`py-2 flex flex-col gap-10 w-full ${
            mobileFullScreen && "pt-10"
          }`}
        >
          {/* Create Album Button */}
          <div
            className="w-full bg-[#372b5b] border-2 border-[#855aff] rounded-xl hover:bg-blue-400 transition duration-200"
            onClick={() => {
              setAddModal(true);
              if (mobileFullScreen) toggleMobileMenu();
            }}
          >
            <div className="px-5 py-3 text-center flex items-center justify-center gap-2 cursor-pointer">
              <p className="self-center text-xl font-semibold select-none">
                Create Album
              </p>
              <IoMdAdd size={20} className="self-center select-none" />
            </div>
          </div>

          <div className="h-2" />

          {/* Album Section */}
          <div className="flex flex-col gap-7">
            <h1
              className="text-2xl font-bold cursor-pointer"
              onClick={() => {
                navigate("/dashboard");
                if (mobileFullScreen) toggleMobileMenu();
              }}
            >
              Albums
            </h1>

            {/* Pinned Albums */}
            <div className="flex flex-col">
              <div className="flex gap-4">
                <h4 className="text-gray-400">Pinned Albums</h4>
                <PinIcon width={20} height={20} />
              </div>
              <ul className="font-semibold text-xl">
                {pinnedAlbums &&
                  pinnedAlbums.map((album) => (
                    <AlbumMenu
                      key={album._id}
                      album={album}
                      handleUnpin={handleUnpin}
                      type="pinned"
                      onClick={handleAlbumSelect}
                      mobileFullScreen={mobileFullScreen}
                      toggleMobileMenu={toggleMobileMenu}
                    />
                  ))}
              </ul>
            </div>

            {/* All Albums */}
            <div className="py-2 mb-2 flex flex-col w-full thin-scrollbar pr-1">
              <h1 className="text-gray-400">All Albums</h1>
              {loading ? (
                <div className="flex flex-col w-full items-center justify-center">
                  <BeatLoader />
                </div>
              ) : (
                <div
                  className={`${
                    mobileFullScreen ? "h-[50vh]" : "max-h-[40vh]"
                  } overflow-y-auto thin-scrollbar flex flex-col`}
                >
                  {albums &&
                    albums.map((album) => (
                      <AlbumMenu
                        key={album._id}
                        album={album}
                        handlePin={handlePin}
                        type="unpinned"
                        onClick={handleAlbumSelect}
                        mobileFullScreen={mobileFullScreen}
                        toggleMobileMenu={toggleMobileMenu}
                      />
                    ))}
                </div>
              )}
            </div>
          </div>

          {/* Bottom Menu */}
          <div className="absolute bottom-4 right-0 px-5 w-full flex flex-col gap-3 items-center">
            <div
              onClick={() => {
                setWaterMarkModal(true);
                if (mobileFullScreen) toggleMobileMenu();
              }}
              className="
              w-11/12 
              bg-[#372b5b] 
              border-2 
              border-[#855aff] 
              rounded-xl 
              hover:bg-[#4a3a75] 
              transition 
              duration-200 
              cursor-pointer
            "
            >
              <div className="px-5 py-3 text-center flex items-center justify-center gap-2">
                <p className="self-center text-xl font-semibold select-none">
                  Add Your Watermark
                </p>
                {/* Use WatermarkIcon if available, otherwise use IoMdAdd */}
                <WatermarkIcon
                  width={50}
                  height={40}
                  className="self-center select-none"
                  // Fallback to IoMdAdd if WatermarkIcon is not available
                  onError={(e) => {
                    e.target.style.display = "none";
                    const addIcon = document.createElement("div");
                    addIcon.innerHTML = "<IoMdAdd size={20} />";
                    e.target.parentNode.appendChild(addIcon);
                  }}
                />
              </div>
            </div>
            <div
              onClick={() => {
                setReferModa(true);
                if (mobileFullScreen) toggleMobileMenu();
              }}
              className="w-11/12 flex gap-2 items-center cursor-pointer"
            >
              <ShareIcon width={25} height={25} />
              <h2>Refer & Share</h2>
            </div>

            <div
              onClick={() => dispatch(logout())}
              className="flex w-11/12 relative bg-[#855aff] text-white rounded-xl px-4 py-1 font-semibold cursor-pointer"
            >
              <p>Log out</p>
              <div className="absolute right-2 font-extrabold">
                <LogoutIcon width={20} height={20} className="font-extrabold" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SideMenu;
