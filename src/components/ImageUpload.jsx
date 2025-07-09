import React, { useCallback, useEffect, useState } from "react";
import { useDropzone } from "react-dropzone";
import { ReactComponent as UploadIcon } from "../assets/upload-minimalistic-svgrepo-com.svg";
import imageCompression from "browser-image-compression";

function MyDropzone({ setFiles, setLoading }) {
  const onDrop = useCallback(
    async (acceptedFiles) => {
      try {
        // Show loading state
        console.log("Starting compression...");

        setLoading(true);
        setFiles((prev) => [...prev, ...acceptedFiles]);

        // Set the state with the compressed files
        // setFiles((prev) => [...prev, ...compressedFiles]);
        setLoading(false);

        console.log("Compression complete.");
      } catch (error) {
        console.error("Error in onDrop:", error);
      }
    },
    [setFiles, setLoading]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
  });

  return (
    <div>
      <div
        {...getRootProps()}
        className="w-full  flex flex-col justify-center items-center h-40 mx-auto md:rounded-2xl rounded-lg bg-white"
      >
        <input {...getInputProps()} className="w-full" />
        {isDragActive ? (
          <p className="py-10 px-4 w-full">Drop the files here ...</p>
        ) : (
          <div className="flex flex-col gap-3 max-h-full items-center w-11/12">
            <UploadIcon size={3} className="max-h-8" />
            <p className="px-4 text-gray-400">
              Drag 'n' drop / Upload Images here
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default MyDropzone;
