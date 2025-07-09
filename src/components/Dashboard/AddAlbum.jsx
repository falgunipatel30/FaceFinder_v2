import React, { useState } from "react";
import { IoMdClose } from "react-icons/io";
import { useSelector } from "react-redux";
import { addNewAlbum } from "../../services/operations/album";
import { ReactComponent as ImageIcon } from "../../assets/image-svgrepo-com.svg";
import toast from "react-hot-toast";

const AddAlbum = ({ setAddModal, setCurrAlbum, setAlbum, setLoading }) => {
  const [name, setName] = useState("");
  const { token } = useSelector((state) => state.auth);

  const handleAddAlbum = async () => {
    try {
      const data = {
        name: name,
        token: token,
      };
      await addNewAlbum(data, setLoading, setAlbum, setCurrAlbum);
      toast.success("album added successfully");
    } catch (error) {
      toast.error("Failed to add album");
      console.error(error);
    } finally {
      setName("");
      setAddModal(false);
    }
  };

  return (
    <div className=" fixed h-fit top-1/2 left-1/2 md:px-2 transform -translate-x-1/2 -translate-y-1/2 w-fit text-center md:w-1/4  bg-black rounded-2xl md:py-10 ">
      <div className="relative w-11/12 mx-auto h-full">
        <div className="flex justify-between items-center mb-10">
          <h1 className="font-bold text-5xl text-white">Add album</h1>
          <div className="rounded-full bg-red-500 h-8 w-8">
            <IoMdClose
              onClick={() => setAddModal(false)}
              className="hover:cursor-pointer text-white"
              size={30}
              fontWeight={1000}
            />
          </div>
        </div>

        <div className="flex flex-col items-center">
          <form
            className="flex  flex-col gap-10 w-full"
            onSubmit={handleAddAlbum}
          >
            <label className="max-h-16 items-center rounded-2xl w-full bg-white flex md:pl-4">
              <ImageIcon className="h-16 w-8" fill="currentColor" />
              <input
                type="text"
                value={name}
                placeholder="Album Name"
                onChange={(e) => setName(e.target.value)}
                className="outline-none h-full px-2 rounded-3xl w-full"
              />
            </label>

            <div className="w-full bg-[#855aff] text-white py-4 px-7 rounded-2xl text-start">
              <button
                type="submit"
                className=" font-bold text-2xl w-11/12 text-start"
              >
                Create Now
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddAlbum;
