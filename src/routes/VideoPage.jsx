import {
  AiOutlineLike,
  AiOutlineClockCircle,
  AiOutlineShareAlt
} from "react-icons/ai";
import { RiPlayListAddFill } from "react-icons/ri";
import { HiChevronDown } from "react-icons/hi";
import VideoPlayer from "../components/VideoPlayer";
import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { usePlaylist } from "../context/playlistContext";
import { useVideo } from "../context/videosContext";
import { useMutation } from "react-query";
import { useAuth } from "../context/authContext";
import { liked, watchLater, history } from "../Api/videosApi";
import CompactSideBar from "../components/Navbar/CompactSideBar";
import ComentSection from "../components/CommentSection";
import toast from "react-hot-toast";
import PlaylistModal from "../components/Modal/PlaylistModal";
import ShareModal from "../components/Modal/ShareModal";
import LoginModal from "../components/Modal/LoginModal";
import PageLoading from "../components/Utils/PageLoading";
import MoreVideos from "../components/MoreVideos";

const VideoPage = () => {
  const { videoID } = useParams();
  const { user } = useAuth();
  const { state, playlistDispatch } = usePlaylist();
  const { videoState, allVideosLoading } = useVideo();
  const [likeActive, setLikeActive] = useState(false);
  const [watchLaterActive, setWatchLaterActive] = useState(false);
  const [video, setVideo] = useState("");
  const [openPlaylistModal, setOpenPlaylistModal] = useState(false);
  const [openShareModal, setOpenShareModal] = useState(false);
  const [openLoginModal, setOpenLoginModal] = useState(false);
  const [pageLoading, setPageLoading] = useState(false);

  const { mutate: historyMutate } = useMutation(history, {
    onSuccess: data => {
      playlistDispatch({
        type: "FETCH_HISTORY_VIDEOS",
        payload: data?.history.videos
      });
    }
  });

  useEffect(() => {
    if (user) {
      historyMutate(videoID);
    }
  }, [user, historyMutate, videoID]);

  useEffect(() => {
    const foundVideo = videoState?.videos?.find(item => item._id === videoID);
    setVideo(foundVideo);

    state.liked?.find(item => item._id === video?._id) && setLikeActive(true);
    state.watchLater?.find(item => item._id === video?._id) &&
      setWatchLaterActive(true);
  }, [
    state.liked,
    video?._id,
    state.watchLater,
    videoID,
    videoState,
    historyMutate,
    user
  ]);

  const { isLoading: likeLoading, mutate: likeMutate } = useMutation(liked, {
    onSuccess: data => {
      playlistDispatch({
        type: "ADD_TO_LIKED_VIDEOS",
        payload: data.likedPlaylist.videos
      });
      if (likeActive) {
        toast.success("Removed from liked videos");
      } else {
        toast.success("Added to liked videos");
      }
    }
  });

  const {
    isLoading: watchLaterLoading,
    mutate: watchLaterMutate
  } = useMutation(watchLater, {
    onSuccess: data => {
      playlistDispatch({
        type: "ADD_TO_WATCH_LATER_VIDEOS",
        payload: data.watchLaterPlaylist.videos
      });

      if (watchLaterActive) {
        toast.success("Removed from watch later");
      } else {
        toast.success("Added to watch later");
      }
    }
  });

  if (allVideosLoading) return <PageLoading />;

  return (
    <div className="flex">
      {pageLoading && <PageLoading />}
      <PlaylistModal
        openModal={openPlaylistModal}
        setOpenModal={setOpenPlaylistModal}
        videoID={videoID}
      />
      <ShareModal
        openShareModal={openShareModal}
        setOpenShareModal={setOpenShareModal}
        location={window.location.pathname}
      />
      <LoginModal openModal={openLoginModal} setOpenModal={setOpenLoginModal} />

      <div className="hidden lg:block">
        <CompactSideBar />
      </div>

      <div className="w-full lg:w-2/3">
        {/* Video */}
        <div className="lg:px-5 lg:pt-5">
          <VideoPlayer videoId={video?.videoId} />
        </div>

        {/* Video info */}
        <div className="px-5 py-5 border-b border-white-1">
          <div className="flex items-center justify-between">
            <p className="font-poppins font-normal text-base lg:text-xl pr-1 text-black-1">
              {video?.title}
            </p>
            <HiChevronDown className="w-8 h-6 text-black-2" />
          </div>
          <div className="flex items-center mt-3">
            <p className="font-poppins font-normal text-xs lg:text-sm text-gray-1 mr-4">
              {video?.viewCount} views
            </p>
            <p className="font-poppins font-normal text-xs lg:text-sm text-gray-1">
              {video?.uploadDate}
            </p>
          </div>

          <div className="flex items-center justify-start mt-5 w-full">
            <button
              onClick={() => {
                if (user) {
                  likeMutate(video?._id);
                  setLikeActive(!likeActive);
                } else {
                  setOpenLoginModal(true);
                }
              }}
              className={`flex items-center tracking-tight lg:tracking-normal font-poppins bg-white-1 px-2.5 py-1.5 rounded-3xl ${
                likeActive ? "text-primary-red" : "text-black-2"
              } text-xs xs:text-sm mr-1 xs:mr-2 active:bg-white-2 ${likeLoading &&
                "animate-pulse"} transition-all lg:hover:bg-white-2`}
              disabled={likeLoading && true}
            >
              <AiOutlineLike className="mr-1 w-4 xs:w-5 h-4 xs:h-5" />
              {video?.likeCount}
            </button>
            <button
              onClick={() => {
                if (user) {
                  watchLaterMutate(video?._id);
                  setWatchLaterActive(!watchLaterActive);
                } else {
                  setOpenLoginModal(true);
                }
              }}
              className={`flex items-center tracking-tight lg:tracking-normal font-poppins bg-white-1 px-2.5 py-1.5 rounded-3xl ${
                watchLaterActive ? "text-primary-red" : "text-black-2"
              }
            text-xs xs:text-sm mr-1 xs:mr-2 active:bg-white-2 ${watchLaterLoading &&
              "animate-pulse"} transition-all lg:hover:bg-white-2`}
            >
              <AiOutlineClockCircle className="mr-1 w-4 xs:w-5 h-4 xs:h-5" />
              Watch Later
            </button>
            <button
              onClick={() => {
                if (user) {
                  setOpenPlaylistModal(true);
                } else {
                  setOpenLoginModal(true);
                }
              }}
              className="flex items-center tracking-tight lg:tracking-normal font-poppins bg-white-1 px-2.5 py-1.5 rounded-3xl text-black-2 text-xs xs:text-sm mr-1 xs:mr-2 active:bg-white-2 transition-all lg:hover:bg-white-2"
            >
              <RiPlayListAddFill className="mr-1 w-3.5 xs:w-4 h-3.5 xs:h-4" />
              Save
            </button>
            <button
              onClick={() => setOpenShareModal(true)}
              className="flex items-center ml-auto bg-white-1 px-2.5 py-1.5 rounded-2xl active:bg-white-2 transition-all lg:hover:bg-white-2"
            >
              <AiOutlineShareAlt className="w-4 xs:w-5 h-4 xs:h-5 text-black-2" />
            </button>
          </div>
        </div>

        {/* channel info */}
        <div className="flex justify-start items-center px-5 py-2 border-b border-white-1">
          <img
            className="rounded-full w-10 h-10"
            src={video?.channelDisplayPic}
            alt=""
          />
          <div className="flex flex-col font-poppins ml-2.5">
            <p className="text-base text-black-1">{video?.channelName}</p>
            <p className="text-xs text-gray-1">
              {video?.subscribers} Subscribers
            </p>
          </div>
        </div>

        <ComentSection
          video={video}
          setPageLoading={setPageLoading}
          setOpenLoginModal={setOpenLoginModal}
        />
      </div>

      <div className="w-1/3 hidden lg:block">
        <MoreVideos />
      </div>
    </div>
  );
};

export default VideoPage;
