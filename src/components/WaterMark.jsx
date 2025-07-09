import React, { useState, useEffect } from "react";
import { useDropzone } from "react-dropzone";
import axios from "axios";
import { useParams } from "react-router";
import { useDispatch, useSelector } from "react-redux";
import { fetchItem } from "../slices/currentItemSlice";

const positions = ["northwest", "northeast", "southwest", "southeast"];

const WatermarkModal = ({ setWaterMarkModal }) => {
  const [file, setFile] = useState(null);
  const [position, setPosition] = useState("southeast");
  const [loading, setLoading] = useState(false);
  const [selectedAlbum, setSelectedAlbum] = useState("");
  const [watermarkSize, setWatermarkSize] = useState(100); // Watermark size percentage
  const [previewUrl, setPreviewUrl] = useState(null); // Preview image URL
  const [mode, setMode] = useState("overlap");
  const { albumId } = useParams();
  const { token } = useSelector((state) => state.auth);
  const { albums } = useSelector((state) => state.albums);
  const dispatch = useDispatch();

  const onDrop = (acceptedFiles) => {
    setFile(acceptedFiles[0]);
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "image/*": [],
    },
    multiple: false,
  });

  const handleApplyWatermark = async () => {
    if (!file) return alert("Please upload a watermark logo");

    const formData = new FormData();
    formData.append("watermark", file);
    formData.append("position", position);
    formData.append("albumId", selectedAlbum);
    formData.append("size", watermarkSize);

    try {
      setLoading(true);
      const res = await axios.post(
        "http://localhost:4000/api/album/add-watermark",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${token}`,
          },
        }
      );
      alert("✅ Watermark applied successfully!");
      setWaterMarkModal(false);
      await dispatch(fetchItem({ albumId: selectedAlbum }));
    } catch (err) {
      console.error("❌ Error applying watermark:", err);
      alert("Failed to apply watermark.");
    } finally {
      setLoading(false);
    }
  };

  const fetchPreview = async () => {
    if (!file) return;

    // Set loading to true to disable inputs and show loading state
    setLoading(true);

    // Delay the API call by 2 seconds

    const formData = new FormData();
    formData.append("watermark", file);
    formData.append("position", position);
    formData.append("size", watermarkSize);
    // formData.append("albumId", selectedAlbum);  // Uncomment if needed
    formData.append("mode", mode);

    try {
      const res = await axios.post(
        "http://localhost:4000/api/album/watermarkPrevie", // Fixed typo: 'watermarkPrevie' -> 'watermarkPreview'
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${token}`,
          },
        }
      );
      console.log(res);
      setPreviewUrl(res.data.watermarkedImageUrl); // Assuming the backend returns the preview URL
    } catch (err) {
      console.error("Error fetching preview:", err);
    } finally {
      // Set loading to false after the API call
      setLoading(false);
    } // Timeout of 2 seconds before API request
  };

  // Fetch the preview when file, size, or position changes
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      fetchPreview(); // Fetch preview after 2 seconds of slider change
    }, 2000);
  }, [file, watermarkSize, position, selectedAlbum, mode]);

  return (
    <div className="fixed top-0 left-0 w-full h-full bg-black/50 z-50 flex justify-center items-center">
      <div className="bg-white rounded-lg p-6 w-[90%] max-w-md relative flex">
        <div className="w-1/2">
          <h2 className="text-lg font-semibold mb-4">Add Watermark</h2>
          {/* Watermark Mode Selection */}
          <label className="block mb-2 text-sm font-medium">
            Watermark Mode
          </label>
          <select
            value={mode}
            onChange={(e) => setMode(e.target.value)}
            className="w-full border px-3 py-2 rounded-md mb-4"
          >
            <option value="overlap">Overlap</option>
            <option value="transparent">Transparent</option>
          </select>
          {/* Album Dropdown */}
          <label className="block mb-1 font-medium text-sm">Select Album</label>
          <select
            className="w-full border px-3 py-2 rounded-md mb-4"
            value={selectedAlbum}
            onChange={(e) => setSelectedAlbum(e.target.value)}
          >
            <option value="">-- Select Album --</option>
            {albums.map((album) => (
              <option key={album._id} value={album._id}>
                {album.name}
              </option>
            ))}
          </select>
          <div
            {...getRootProps()}
            className="border-dashed border-2 border-gray-300 rounded-md p-6 text-center cursor-pointer mb-4"
          >
            <input {...getInputProps()} />
            {file ? (
              <p className="text-sm text-gray-700">{file.name}</p>
            ) : isDragActive ? (
              <p className="text-sm text-gray-500">
                Drop your watermark logo here
              </p>
            ) : (
              <p className="text-sm text-gray-500">
                Click or drag & drop logo (PNG/JPG)
              </p>
            )}
          </div>

          <label className="block mb-2 text-sm font-medium">
            Watermark Position
          </label>
          <select
            value={position}
            onChange={(e) => setPosition(e.target.value)}
            className="w-full border px-3 py-2 rounded-md mb-4"
            disabled={loading}
          >
            {positions.map((pos) => (
              <option key={pos} value={pos}>
                {pos.replace("-", " ").toUpperCase()}
              </option>
            ))}
          </select>

          <label className="block mb-2 text-sm font-medium">
            Watermark Size ({watermarkSize}%)
          </label>
          <input
            type="range"
            min="10"
            max="100"
            value={watermarkSize}
            onChange={(e) => setWatermarkSize(e.target.value)}
            className="w-full mb-4"
            disabled={loading}
          />

          <button
            onClick={handleApplyWatermark}
            disabled={loading}
            className="w-full bg-black text-white py-2 rounded hover:bg-gray-800 transition"
          >
            {loading ? "Applying..." : "Apply Watermark"}
          </button>
        </div>

        <div className="w-1/2 ml-6">
          {previewUrl ? (
            <img
              src={previewUrl}
              alt="Watermark Preview"
              className="w-full h-auto object-contain border"
            />
          ) : (
            <p className="text-center text-gray-500">No preview available</p>
          )}
        </div>

        <button
          className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
          onClick={() => setWaterMarkModal(false)}
        >
          &times;
        </button>
      </div>
    </div>
  );
};

export default WatermarkModal;
