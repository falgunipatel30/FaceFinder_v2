import React, { useEffect, useState } from "react";
import SideMenu from "../components/Dashboard/SideMenu";
import Gallery from "../components/Dashboard/Gallery";
import AddAlbum from "../components/Dashboard/AddAlbum";
import { useDispatch, useSelector } from "react-redux";
import ShareBox from "../components/Gallery/ShareModal";
import { Route, Routes } from "react-router";
import { fetchAlbums } from "../slices/albumSlice";
import AllAlbums from "./AllAlbums";
import WatermarkModal from "../components/WaterMark";

const Dashboard = () => {
  const dispatch = useDispatch();
  const [loading, setLoading] = useState("");
  const { token } = useSelector((state) => state.auth);
  const [addModal, setAddModal] = useState(false);
  const [album, setAlbum] = useState();
  const [currAlbum, setCurrAlbum] = useState(null);
  const [pinnedAlbums, setPinnedAlbums] = useState([]);
  const [referModal, setReferModal] = useState(false);
  const [waterMarkModal, setWaterMarkModal] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  useEffect(() => {
    dispatch(fetchAlbums());
  }, [dispatch]);

  const onCloseReferModal = () => {
    setReferModal(false);
  };

  return (
    <>
      {/* Mobile Full Screen Side Menu */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-40 md:hidden">
          <SideMenu
            setAddModal={setAddModal}
            album={album}
            setCurrAlbum={setCurrAlbum}
            currAlbum={currAlbum}
            loading={loading}
            pinnedAlbums={pinnedAlbums}
            setPinnedAlbums={setPinnedAlbums}
            setLoading={setLoading}
            setAlbum={setAlbum}
            setReferModa={setReferModal}
            setWaterMarkModal={setWaterMarkModal}
            isMobileMenuOpen={isMobileMenuOpen}
            toggleMobileMenu={toggleMobileMenu}
            mobileFullScreen={true}
          />
        </div>
      )}

      <div
        className={`flex min-h-screen w-full ${
          addModal || isMobileMenuOpen ? "blur pointer-events-none" : ""
        }`}
      >
        {/* Desktop Side Menu */}
        <div className="hidden md:flex w-[15%]">
          <SideMenu
            setAddModal={setAddModal}
            album={album}
            setCurrAlbum={setCurrAlbum}
            currAlbum={currAlbum}
            loading={loading}
            pinnedAlbums={pinnedAlbums}
            setPinnedAlbums={setPinnedAlbums}
            setLoading={setLoading}
            setAlbum={setAlbum}
            setReferModa={setReferModal}
            setWaterMarkModal={setWaterMarkModal}
            isMobileMenuOpen={isMobileMenuOpen}
            toggleMobileMenu={toggleMobileMenu}
          />
        </div>

        {/* Main Content Area */}
        <div className="md:w-[85%] w-full max-h-[calc(100vh-5rem)]">
          {/* Mobile Menu Toggle Button - Only show when menu is closed */}
          {!isMobileMenuOpen && (
            <div className="md:hidden fixed top-4 left-4 z-50">
              <button
                onClick={toggleMobileMenu}
                className="
              w-10 h-10 
              bg-gray-100 
              rounded-md 
              flex flex-col 
              justify-center 
              items-center 
              space-y-1.5 
              p-2
            "
              >
                <span className="w-full h-0.5 bg-gray-700 block"></span>
                <span className="w-full h-0.5 bg-gray-700 block"></span>
                <span className="w-full h-0.5 bg-gray-700 block"></span>
              </button>
            </div>
          )}
          <Routes>
            <Route path="/" element={<AllAlbums />} />
            <Route
              path="/album/:albumId"
              element={
                <Gallery
                  currAlbum={currAlbum}
                  setCurrAlbum={setCurrAlbum}
                  setAlbum={setAlbum}
                  album={album}
                  loading={loading}
                  setLoading={setLoading}
                />
              }
            />
            <Route
              path="/album/:albumId/folder/:folderId/*"
              element={
                <Gallery
                  currAlbum={currAlbum}
                  setCurrAlbum={setCurrAlbum}
                  setAlbum={setAlbum}
                  album={album}
                  loading={loading}
                  setLoading={setLoading}
                  waterMarkModal={waterMarkModal}
                />
              }
            />
          </Routes>
        </div>
      </div>

      {/* Modal Overlays */}
      {addModal && (
        <AddAlbum
          setAddModal={setAddModal}
          setAlbum={setAlbum}
          setCurrAlbum={setCurrAlbum}
          setLoading={setLoading}
        />
      )}

      {referModal && (
        <ShareBox
          url={`http://localhost:3000`}
          onCloseShareModal={onCloseReferModal}
        />
      )}

      {waterMarkModal && (
        <WatermarkModal setWaterMarkModal={setWaterMarkModal} />
      )}
    </>
  );
};

export default Dashboard;
