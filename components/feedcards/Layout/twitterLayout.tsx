import { useCurrentUser } from "@/hooks/user";
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import Image from "next/image";
import { CiCircleMore } from "react-icons/ci";
import { FaHashtag } from "react-icons/fa6";
import { GoHomeFill } from "react-icons/go";
import { IoPersonOutline } from "react-icons/io5";
import { MdOutlineLocalPostOffice } from "react-icons/md";
import { PiBell, PiBookmarkSimple } from "react-icons/pi";
import { CredentialResponse, GoogleLogin } from "@react-oauth/google";
import toast from "react-hot-toast";
import { graphqlClient } from "@/client/api";
import { verifyUserGoogleTokenQuery } from "@/graphql/query/user";
import { useQueryClient } from "@tanstack/react-query";
import { useCreateTweet } from "@/hooks/tweet";
import { BiImageAlt } from "react-icons/bi";
import { IoMdSend } from "react-icons/io";
import Link from "next/link";
import ConfirmDialog from "../dialog";

interface TwitterSidebarButton {
  title: string;
  icon: React.ReactNode;
  link: string;
}

interface TwitterlayoutProps {
  children: React.ReactNode;
}

const Twitterlayout: React.FC<TwitterlayoutProps> = (props) => {
  const { user } = useCurrentUser();
  const queryClient = useQueryClient();
  const { mutate } = useCreateTweet();
  const tweetCardRef = useRef<HTMLDivElement>(null);

  const [content, setContent] = useState("");
  const [isTweetCardOpen, setTweetCardOpen] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const sidebarMenuItems: TwitterSidebarButton[] = useMemo(
    () => [
      {
        title: "Home",
        icon: <GoHomeFill />,
        link: "/",
      },
      {
        title: "Explore",
        icon: <FaHashtag />,
        link: "/",
      },
      {
        title: "Notifications",
        icon: <PiBell />,
        link: "/",
      },
      {
        title: "Messages",
        icon: <MdOutlineLocalPostOffice />,
        link: "/",
      },
      {
        title: "Bookmarks",
        icon: <PiBookmarkSimple />,
        link: "/",
      },
      {
        title: "Profile",
        icon: <IoPersonOutline />,
        link: `/${user?.id}`,
      },
      {
        title: "More",
        icon: <CiCircleMore />,
        link: "/",
      },
    ],
    [user?.id]
  );

  const handleInputChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    const textarea = event.target;
    setContent(textarea.value);

    textarea.style.height = "auto";
    textarea.style.height = `${textarea.scrollHeight}px`;
  };

  const handleCreateTweet = useCallback(() => {
    if (content.trim() === "") {
      toast.error("Please enter some content to Tweet");
      return;
    }

    try {
      mutate({
        content,
      });

      setContent("");

      const textarea = document.querySelector(
        ".textarea-auto-resize"
      ) as HTMLTextAreaElement;
      if (textarea) {
        textarea.style.height = "auto";
      }

      setTweetCardOpen(false);
    } catch (error) {
      toast.error(
        "There was an error posting your tweet. Please try again later."
      );
    }
  }, [content, mutate]);

  const handleSelectImage = useCallback(() => {
    const input = document.createElement("input");
    input.setAttribute("type", "file");
    input.setAttribute("accept", "image/*");
    input.click();
  }, []);

  const handleLoginWithGoogle = useCallback(
    async (cred: CredentialResponse) => {
      const googleToken = cred.credential;
      if (!googleToken) return toast.error("Google token not found");

      const { verifyGoogleToken } = await graphqlClient.request(
        verifyUserGoogleTokenQuery,
        { token: googleToken }
      );

      toast.success("Verified successfully");
      console.log(verifyGoogleToken);

      if (verifyGoogleToken)
        window.localStorage.setItem("twitter_token", verifyGoogleToken);

      await queryClient.invalidateQueries({ queryKey: ["current-user"] });
    },
    [queryClient]
  );

  const toggleTweetCard = () => {
    setTweetCardOpen((prev) => !prev);
  };

  const handleClickOutside = useCallback((event: MouseEvent) => {
    if (
      tweetCardRef.current &&
      !tweetCardRef.current.contains(event.target as Node)
    ) {
      setTweetCardOpen(false);
    }
  }, []);

  useEffect(() => {
    const logoutFlag = localStorage.getItem("logout_flag");

    if (logoutFlag) {
      toast.success("You have successfully logged out. See you soon!");
      localStorage.removeItem("logout_flag");
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("twitter_token");
    localStorage.setItem("logout_flag", "true");
    window.location.reload();
  };

  const openConfirmDialog = () => {
    setIsDialogOpen(true);
  };

  return (
    <div className="grid grid-cols-10 lg:h-screen w-screen md:px-16 lg:gap-4">
      <div className="col-span-1 lg:col-span-2 lg:pt-2 flex flex-col justify-between">
        <div className="mt-1 pr-3">
          <ul>
            {sidebarMenuItems.map((item) => (
              <li key={item.title}>
                <Link
                  className="flex justify-start items-center gap-3 hover:bg-gray-800 rounded-full px-3 py-2 w-fit cursor-pointer transition-all mt-2"
                  href={item.link}
                >
                  <span className="text-2xl">{item.icon}</span>{" "}
                  <span className=" hidden lg:inline text-md font-medium text-white">
                    {item.title}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
          <div className="mt-5 pr-4">
            <div className="flex flex-col gap-2">
              <button
                onClick={toggleTweetCard}
                className="bg-[#1d9bf0] rounded-full w-full py-3 font-bold text-white hover:bg-blue-600 transition-all lg:block hidden"
              >
                Post
              </button>
              <button
                onClick={toggleTweetCard}
                className=" rounded-full p-3 text-white  transition-all lg:hidden block"
              >
                <IoMdSend className="text-2xl" />
              </button>
            </div>
          </div>
        </div>
        {user && (
          <div className="flex gap-2 items-center px-4 py-3 rounded-full mb-5">
            {user.profileImageURL ? (
              <Image
                className="rounded-full"
                src={user.profileImageURL}
                alt="user-image"
                height={50}
                width={50}
              />
            ) : (
              <div className="bg-slate-700 text-white rounded-full h-10 w-10 flex items-center justify-center">
                {user.firstName.charAt(0)}
              </div>
            )}
            <div className="hidden lg:block">
              <h3 className="text-sm font-bold text-white">
                {user.firstName} {user.lastName}
              </h3>
              <h3 className="text-xs text-gray-500">{user.email}</h3>
            </div>
          </div>
        )}
      </div>

      <div className="col-span-9 lg:col-span-5 border-r border-l border-gray-700 h-full overflow-y-scroll no-scrollbar">
        {props.children}

        {isTweetCardOpen && (
          <div
            onClick={() => setTweetCardOpen(false)}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          >
            {user ? (
              <div
                ref={tweetCardRef}
                onClick={(e) => e.stopPropagation()}
                className="ml-0 mb-5 border border-slate-700 shadow-lg w-full max-w-lg rounded-lg p-4 flex flex-col gap-4 bg-slate-900"
              >
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0">
                    {user.profileImageURL ? (
                      <Image
                        className="rounded-full"
                        src={user.profileImageURL}
                        alt="user-image"
                        height={50}
                        width={50}
                      />
                    ) : (
                      <div className="bg-slate-800 text-white rounded-full h-12 w-12 flex items-center justify-center text-lg font-bold">
                        {user.firstName.charAt(0) || "U"}
                      </div>
                    )}
                  </div>
                  <textarea
                    className="textarea-auto-resize no-scrollbar bg-[#333333] text-white border-none focus:ring-2 focus:ring-blue-500 rounded-lg resize-none w-full h-28 p-3"
                    placeholder="What's happening?"
                    rows={4}
                    value={content}
                    onChange={handleInputChange}
                  ></textarea>
                </div>

                <div className="flex justify-between items-center mt-2">
                  <BiImageAlt
                    onClick={handleSelectImage}
                    className="text-2xl cursor-pointer text-gray-400 hover:text-white transition-all"
                  />
                  <button
                    onClick={handleCreateTweet}
                    className="bg-[#1d9bf0] font-semibold text-sm py-2 px-4 rounded-full text-white hover:bg-blue-600 transition-all"
                  >
                    Post
                  </button>
                </div>
              </div>
            ) : (
              <div
                ref={tweetCardRef}
                className="bg-slate-900 border border-gray-700 rounded-xl p-6 max-w-md mx-auto"
              >
                <h1 className="text-2xl font-bold text-white mb-4">
                  New to X?
                </h1>
                <p className="text-sm mb-6 text-gray-400">
                  Sign in now to get your own personalized timeline!
                </p>
                <div className="mb-6">
                  <GoogleLogin onSuccess={handleLoginWithGoogle} />
                </div>
                <p className="text-xs text-gray-500">
                  By signing up, you agree to the Terms of Service and Privacy
                  Policy, including Cookie use.
                </p>
              </div>
            )}
          </div>
        )}
      </div>
      <div className="hidden lg:block lg:col-span-3">
        {user ? (
          <div className=" flex flex-col justify-end h-full  ">
            <button
              onClick={openConfirmDialog}
              className="w-full m-5 bg-red-500 hover:bg-red-600 rounded-lg font-semibold text-white py-2 "
            >
              Logout
            </button>

            <ConfirmDialog
              isOpen={isDialogOpen}
              onClose={() => setIsDialogOpen(false)}
              onConfirm={() => {
                handleLogout();
                setIsDialogOpen(false);
              }}
            />
          </div>
        ) : (
          <div
            ref={tweetCardRef}
            className="bg-slate-900 border border-gray-700 rounded-xl mt-2 p-6 max-w-md mx-auto"
          >
            <h1 className="text-2xl font-bold text-white mb-4">New to X?</h1>
            <p className="text-sm mb-6 text-gray-400">
              Sign in now to get your own personalized timeline!
            </p>
            <div className="mb-6">
              <GoogleLogin onSuccess={handleLoginWithGoogle} />
            </div>
            <p className="text-xs text-gray-500">
              By signing up, you agree to the Terms of Service and Privacy
              Policy, including Cookie use.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Twitterlayout;
