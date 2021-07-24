import ReactModal from "react-modal";
import { AiOutlinePlus } from "react-icons/ai";
import { IoCloseOutline } from "react-icons/io5";
import { GrCheckbox, GrCheckboxSelected } from "react-icons/gr";
import { CgSpinner } from "react-icons/cg";
import { useForm } from "react-hook-form";
import { useMutation } from "react-query";
import { createPlaylist, addToPlaylist } from "../Api/videosApi";
import { usePlaylist } from "../context/playlistContext";

ReactModal.setAppElement("#root");

function Modal({ openModal, setOpenModal, videoID }) {
  const { register, handleSubmit, reset } = useForm();
  const { state, playlistDispatch } = usePlaylist();

  const {
    isLoading: createPlaylistLoading,
    mutate: createMutate
  } = useMutation(createPlaylist, {
    onSuccess: data => {
      playlistDispatch({
        type: "CREATE_PLAYLIST",
        payload: data.newPlaylist
      });
    }
  });

  const { isLoading: playlistLoading, mutate: addMutate } = useMutation(
    addToPlaylist,
    {
      onSuccess: data => {
        playlistDispatch({
          type: "FETCH_PLAYLISTS",
          payload: data.playlists
        });
      }
    }
  );

  const handlePlaylist = playlistId => {
    const data = { playlistId, videoID };
    addMutate(data);
  };

  const submitForm = (data, e) => {
    e.preventDefault();
    reset("", {
      keepValues: false
    });
    createMutate(data);
  };

  const isVideosPresent = playlistVideos => {
    const found = playlistVideos.find(item => item._id === videoID);
    if (found) {
      return <GrCheckboxSelected className="text-xl" />;
    } else {
      return <GrCheckbox className="text-xl" />;
    }
  };

  return (
    <div>
      <ReactModal
        style={{ overlay: { backgroundColor: "rgba(0,0,0,0.5)" } }}
        className="border border-white-1 bg-white font-poppins rounded relative inset-1/2 transform -translate-x-2/4 -translate-y-1/2 w-3/4"
        isOpen={openModal}
        onRequestClose={() => setOpenModal(false)}
      >
        {(playlistLoading || createPlaylistLoading) && (
          <div>
            <div className="absolute bg-white opacity-50 inset-0"></div>
            <CgSpinner className="text-black absolute z-20 text-5xl inset-1/2 transform -translate-x-2/4 -translate-y-1/2" />
          </div>
        )}
        <div className="flex justify-between items-center text-black-1 py-2 px-2 border-b border-white-1">
          <p className="text-lg">Playlists</p>
          <IoCloseOutline
            onClick={() => setOpenModal(false)}
            className="text-2xl cursor-pointer"
          />
        </div>

        <div className="px-2 py-2 border-b border-white-1">
          {state.playlists?.map(item => {
            return (
              <button
                onClick={() => handlePlaylist(item._id)}
                className={
                  "flex justify-between items-center py-1.5 px-2 mb-2 w-full rounded-sm bg-gray-200 cursor-pointer"
                }
                key={item._id}
                disabled={playlistLoading && true}
              >
                <p>{item.name}</p>
                {isVideosPresent(item.videos)}
              </button>
            );
          })}
        </div>

        <div className="border-b border-white-1 flex justify-between items-center text-black-1 px-2 py-2">
          <p className="text-lg">Create new playlist</p>
          <AiOutlinePlus className="text-xl" />
        </div>

        <form
          onSubmit={handleSubmit(submitForm)}
          className="px-2 py-2.5"
          action=""
        >
          <input
            name="name"
            className="w-full px-2 py-1 border-b border-black-1 rounded-sm mb-3 outline-none"
            type="text"
            placeholder="Create a new playlist"
            {...register("name", { required: true })}
          />
          <input
            value="Create"
            className="w-full py-2 bg-primary-red text-white rounded-sm cursor-pointer hover:opacity-90"
            type="submit"
          />
        </form>
      </ReactModal>
    </div>
  );
}

export default Modal;