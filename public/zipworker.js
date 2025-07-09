importScripts(
  "https://cdnjs.cloudflare.com/ajax/libs/jszip/3.7.1/jszip.min.js"
);

self.onmessage = async (event) => {
  const { files } = event.data;

  if (!files || files.length === 0) {
    self.postMessage({ error: "No files provided" });
    self.close();
    return;
  }

  const zip = new JSZip();
  let imageCounter = 0;
  const totalImages = files.length;

  // Process the files
  for (let i = 0; i < totalImages; i++) {
    const file = files[i];
    try {
      const imageBlob = await fetch(file.url).then((res) => res.blob());
      zip.file(file.name, imageBlob); // Add file to zip

      // Send progress updates
      imageCounter++;
      self.postMessage({ progress: (imageCounter / totalImages) * 100 });
    } catch (error) {
      console.error("Error fetching file:", error);
    }
  }

  // Generate zip asynchronously
  const zipContent = await zip.generateAsync({ type: "blob" });

  // Post the zip content and completion progress
  self.postMessage({ progress: 100, zipContent });
  self.close(); // Close the worker
};
