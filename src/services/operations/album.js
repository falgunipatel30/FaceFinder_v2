import axios from "axios";
import { albumEndpoints, authEndpoints } from "../apis";
import toast from "react-hot-toast";
import NProgress from "nprogress";
import "nprogress/nprogress.css";
import {
  fetchAlbums,
  setAlbums,
  setCurrentAlbum,
  setPinnedAlbums,
} from "../../slices/albumSlice";
import { fetchItem, setItemData } from "../../slices/currentItemSlice";
NProgress.configure({
  showSpinner: false, // Hide spinner (cleaner)
  trickleSpeed: 200, // Speed of the auto-increment (lower = slower)
  minimum: 0.1, // Minimum percentage (start from 10%)
});
export const addNewAlbum = async (
  { name, token },
  setLoading,
  setAlbum,
  setCurrAlbum
) => {
  setLoading(true);
  try {
    const response = await axios.post(
      albumEndpoints.ADD_ALBUM,
      { name },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (!response) {
      throw new Error("Failed to add album");
    }

    setAlbum(response.data.user.albums);
    setCurrAlbum(response.data.album);
  } catch (error) {
    console.error(error);
  } finally {
    setLoading(false);
  }
};

export const addNewImages = (
  { albumId, folderId, files },
  token,
  setLoading,
  setShouldFetch
) => {
  return async (dispatch) => {
    setLoading(true);
    NProgress.start();
    try {
      const formData = new FormData();
      formData.append("albumId", albumId);
      if (folderId) {
        formData.append("folderId", folderId);
      }

      files.forEach((file) => {
        formData.append("imageFile", file); // 👈 Append each file with the correct field name
      });
      console.log(formData);
      await axios
        .post(albumEndpoints.ADD_IMAGES, formData, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
          // onUploadProgress: (progressEvent) => {
          //   // Calculate the percentage of the upload completed
          //   const percent = Math.round(
          //     (progressEvent.loaded * 100) / progressEvent.total
          //   );

          //   // Update NProgress with the current progress percentage
          //   NProgress.set(percent / 100); // NProgress accepts a value between 0 and 1
          // },
        })
        .then(() => {
          toast.success("Added images");
          dispatch(fetchItem({ albumId, folderId }));
        })
        .catch((err) => console.log(err));

      // if (!response) {
      //   toast.error("Error");
      //   throw new Error("Failed to add images");
      // }

      // setCurrAlbum(response.data.album);
      // console.log("parent", response.data.parent);
      //dispatch(setCurrentAlbum(response.data.parent));
      //dispatch(setItemData(response.data.parent));
      //console.log("ids", albumId, folderId);
      //await dispatch(fetchItem({ albumId, folderId }));

      // setShouldFetch(false);
      //dispatch(setCurrentAlbum(response.data.curr));
      // console.log("changes", response.data);
      // toast.success("Added images");
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
      NProgress.done();
      await dispatch(fetchItem({ albumId, folderId }));
    }
  };
};

export const deleteAlbum = (
  { albumId, token },
  setLoading,
  setAlbum,
  navigate
) => {
  return async (dispatch) => {
    setLoading("full");
    try {
      const response = await axios.post(
        albumEndpoints.DELETE_ALBUM,
        { albumId },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response) {
        throw new Error("Failed to delete album");
      }

      dispatch(setAlbums(response.data.user.albums));
      dispatch(setPinnedAlbums(response.data.user.pinnedAlbums));
      toast.success("album deleted successfully");
      navigate("/dashboard");
    } catch (err) {
      console.error(err);
    } finally {
      setLoading("");
    }
  };
};

export const deleteImage = (
  { ImageArray, albumId, folderId },
  token,
  setLoading,
  setCurrAlbum
) => {
  return async () => {
    NProgress.start();
    setLoading("photos");

    try {
      const response = await axios.post(
        albumEndpoints.DELETE_IMAGE,
        { ImageArray, albumId, folderId },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response) {
        throw new Error("Failed to delete image");
      }
      setCurrAlbum(response.data.album);

      toast.success("Deleted image");
    } catch (error) {
      console.error(error);
    } finally {
      setLoading("");
      NProgress.done();
    }
  };
};

export const pinAlbum = ({ albumId, token }) => {
  return async (dispatch) => {
    try {
      const response = await axios.post(
        albumEndpoints.PIN_ALBUM,
        { albumId },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response) {
        throw new Error("Failed to pin album");
      }
      await dispatch(fetchAlbums());

      toast.success("Pinned album");
    } catch (error) {
      console.error(error);
    }
  };
};

export const unpinAlbum = ({ albumId, token }) => {
  return async (dispatch) => {
    try {
      const response = await axios.post(
        albumEndpoints.UNPIN_ALBUM,
        { albumId },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (!response) {
        throw new Error("Failed to unpin album");
      }
      await dispatch(fetchAlbums());
      toast.success("Unpinned album");
    } catch (error) {
      console.error(error);
    }
  };
};

export const searchImage = ({ file, token, currImages, setLoading }) => {
  return async (dispatch) => {
    try {
      setLoading("photos");
      console.log("uploaded file", file);
      const formData = new FormData();
      formData.append("file", file);

      const response = await axios.post(albumEndpoints.SEARCH_IMAGE, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });
      console.log("searched-->", response.data.searchResults);
      const searchUrls = response.data.searchResults.map((item) => item.url);
      const searchedImages = currImages.filter((image) =>
        searchUrls.includes(image.url)
      );
      console.log("searcch urls -->", searchUrls);
      console.log("curr Imgs -->", currImages);
      console.log("searched images-->", searchedImages);
      //setItemData(response.data.searchResults);
      dispatch(setItemData(searchedImages));
      toast.success("sorted images");
    } catch (error) {
      console.error(error);
      toast.error("couldn't search");
    } finally {
      setLoading("");
    }
  };
};

export const ratioChange = (
  { ratio, images, albumId, token, folderId },
  setCurrAlbum
) => {
  return async (dispatch) => {
    try {
      // setLoading(true);
      console.log(images);
      const response = await axios.post(
        albumEndpoints.RATIO_CHANGE,
        { images, albumId, ratio, folderId },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (!response) {
        throw new Error("Failed to change ratio");
      }
      //console.log(response.data);
      //setCurrAlbum(response.data.album);
      await dispatch(fetchItem({ albumId, folderId }));
      toast.success("Ratio changed");
    } catch (error) {
      console.error(error);
    }
  };
};

export const createFolder = (
  { albumId, images, token, name, folderId },
  setCurrAlbum,
  setEditImages
) => {
  return async (dispatch) => {
    try {
      console.log(images);
      const response = await axios.post(
        albumEndpoints.CREATE_FOLDER,
        { images, albumId, name, parentFolderId: folderId },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (!response) {
        throw new Error("Failed to create folder");
      }
      console.log(response.data);
      //setCurrAlbum(response.data.album);
      dispatch(fetchItem({ albumId, folderId }));
      setEditImages([]);
      toast.success("Folder created");
    } catch (error) {
      console.error(error);
    }
  };
};

export const getAlbum = async ({ albumId, folderId }) => {
  try {
    if (!albumId) {
      throw new Error("Album ID is required");
    }
    const response = await axios.post(albumEndpoints.GET_ALBUM, {
      albumId,
      folderId,
    });
    console.log(response.data.curr);
    if (!response) {
      throw new Error("Failed to get album");
    }
    return response.data.curr;
  } catch (error) {
    toast.error("Failed to get album");
    console.error(error);
  }
};

export const fetchFolderBreadcrumb = async ({ folderId, token }) => {
  const response = await axios.post(
    albumEndpoints.GET_FOLDER_BREADCRUMB,
    { folderId: folderId },
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
  return {
    crumbs: response.data.breadcrumb,
    album: response.data.album,
  };
};

export const deleteFolder = ({ albumId, folderId, token }, onSuccess) => {
  return async (dispatch) => {
    try {
      const response = await axios.post(
        albumEndpoints.DELETE_FOLDER,
        { albumId, folderId },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response) {
        throw new Error("Failed to delete folder");
      }

      dispatch(fetchItem({ albumId, folderId }));
      toast.success("Folder deleted");

      onSuccess();
    } catch (error) {
      toast.error("failed to delete folder");
      console.error(error);
    }
  };
};
