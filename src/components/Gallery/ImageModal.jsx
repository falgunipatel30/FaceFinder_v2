import axios from "axios";
import React, { useEffect } from "react";
import { RxCross2 } from "react-icons/rx";
import { FaDownload } from "react-icons/fa";

const ImageModal = ({ item, onClose }) => {
  useEffect(() => {
    const handleEsc = (event) => {
      if (event.key === "Escape") {
        onClose(); // close modal on escape
      }
    };

    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [onClose]);

  if (!item) return null;

  // Function to handle image download
  const toDataURL = async (url) => {
    const response = await axios.get(url, { responseType: "blob" });
    const imageDataUrl = URL.createObjectURL(response.data);
    return imageDataUrl;
  };

  const handleDownload = async () => {
    const a = document.createElement("a");
    a.href = await toDataURL(item.url);
    a.download = `${item.name}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-[1000] p-4"
      onClick={onClose} // close on background click
    >
      <div
        className="
          bg-black 
          rounded-lg 
          relative 
          flex 
          flex-col 
          md:flex-row 
          w-full 
          max-w-4xl 
          max-h-[90vh] 
          overflow-auto
        "
        onClick={(e) => e.stopPropagation()} // prevent closing when clicking the modal content
      >
        {/* Close Button */}
        <button
          className="
            absolute 
            top-2 
            right-2 
            bg-red-500 
            text-white 
            rounded-full 
            w-8 
            h-8 
            flex 
            items-center 
            justify-center 
            z-10
          "
          onClick={onClose}
        >
          <RxCross2 size={20} />
        </button>

        {/* Modal Content */}
        <div
          className="
          flex 
          flex-col 
          md:flex-row 
          w-full 
          h-full
        "
        >
          {/* Image Section */}
          <div
            className="
            w-full 
            md:w-1/2 
            flex 
            justify-center 
            items-center 
            p-4
          "
          >
            <img
              src={item.url}
              alt={item.name || "Image"}
              className="
                max-w-full 
                max-h-[60vh] 
                md:max-h-[80vh] 
                object-contain 
                rounded-lg
              "
              width={500}
              height={500}
            />
          </div>

          {/* Details Section */}
          <div
            className="
            w-full 
            md:w-1/2 
            p-4 
            md:pl-6 
            flex 
            flex-col 
            text-white 
            justify-center
          "
          >
            <h2
              className="
              text-lg 
              md:text-xl 
              font-semibold 
              mb-4 
              text-white 
              break-words
            "
            >
              {item.name}
            </h2>
            <div className="mb-4 space-y-2">
              <p className="text-sm md:text-base">
                <strong>Uploaded At:</strong>{" "}
                {new Date(item.addedAt).toLocaleString()}
              </p>
              <p className="text-sm md:text-base">
                <strong>Clicked At:</strong>{" "}
                {item.clickedAt
                  ? new Date(item.clickedAt).toLocaleString()
                  : "Not Available"}
              </p>
            </div>

            {/* Download Button */}
            <button
              onClick={handleDownload}
              className="
                px-4 
                py-2 
                bg-blue-500 
                text-white 
                rounded-lg 
                mt-4 
                w-fit 
                flex 
                items-center 
                gap-2 
                hover:bg-blue-600 
                transition 
                duration-300
              "
            >
              <FaDownload />
              Download Image
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ImageModal;
