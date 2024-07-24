import React, { useCallback, useEffect, useRef, useState } from "react";
import { CiCircleMore } from "react-icons/ci";
import { FaHashtag, FaXTwitter } from "react-icons/fa6";
import { GoHomeFill } from "react-icons/go";
import { IoPersonOutline } from "react-icons/io5";
import { MdOutlineLocalPostOffice } from "react-icons/md";
import { PiBell, PiBookmarkSimple } from "react-icons/pi";
import FeedCard from "@/components/feedcards";
import { CredentialResponse, GoogleLogin } from "@react-oauth/google";
import toast from "react-hot-toast";
import Image from "next/image";
import { graphqlClient } from "@/client/api";
import { verifyUserGoogleTokenQuery } from "@/graphql/query/user";
import { useQueryClient } from "@tanstack/react-query";
import { useCurrentUser } from "@/hooks/user";
import { BiImageAlt } from "react-icons/bi";
import { useCreateTweet, useGetAllTweets } from "@/hooks/tweet";
import { Tweet } from "@/gql/graphql";

interface TwitterSideBarButton {
  title: string;
  icon: React.ReactNode;
}

const sidebarMenuItems: TwitterSideBarButton[] = [
  {
    title: "Home",
    icon: <GoHomeFill />,
  },
  {
    title: "Explore",
    icon: <FaHashtag />,
  },
  {
    title: "Notifications",
    icon: <PiBell />,
  },
  {
    title: "Messages",
    icon: <MdOutlineLocalPostOffice />,
  },
  {
    title: "Bookmarks",
    icon: <PiBookmarkSimple />,
  },
  {
    title: "Profile",
    icon: <IoPersonOutline />,
  },
  {
    title: "More",
    icon: <CiCircleMore />,
  },
];

export default function Home() {
  const { user } = useCurrentUser();
  const { tweets = [] } = useGetAllTweets();
  const { mutate } = useCreateTweet();
  const queryClient = useQueryClient();
  const [content, setContent] = useState("");

  const handleInputChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    const textarea = event.target;
    setContent(textarea.value);

    textarea.style.height = "auto";
    textarea.style.height = `${textarea.scrollHeight}px`;
  };

  const handleCreateTweet = useCallback(() => {
    if (content.trim() === "") {
      toast.error("please enter some content to Tweet");
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
      if (!googleToken) return toast.error(`Google token not found`);

      const { verifyGoogleToken } = await graphqlClient.request(
        verifyUserGoogleTokenQuery,
        { token: googleToken }
      );

      toast.success("verified success");
      console.log(verifyGoogleToken);

      if (verifyGoogleToken)
        window.localStorage.setItem("twitter_token", verifyGoogleToken);

      await queryClient.invalidateQueries({ queryKey: ["current-user"] });
    },
    [queryClient]
  );
  return (
    <div className="grid grid-cols-10 h-screen w-screen px-16">
      <div className="col-span-2 pt-2 relative">
        <div className="mt-1 pr-3">
          <ul>
            {sidebarMenuItems.map((item) => (
              <li
                className="flex justify-start items-center gap-5 hover:bg-gray-800 rounded-full px-2 py-2  w-fit cursor-pointer transition-all mt-1"
                key={item.title[0]}
              >
                <span className="text-2xl">{item.icon}</span>
                <span className="text-lg font-medium">{item.title}</span>
              </li>
            ))}
          </ul>
          <div className="mt-1 pr-4">
            <button className="bg-[#1d9bf0] rounded-full w-full p-3 font-bold">
              Post
            </button>
          </div>
        </div>
        {user && (
          <div className="absolute bottom-5 flex gap-2 items-center px-3 py-2 rounded-full">
            {user && user.profileImageURL && (
              <Image
                className="rounded-full"
                src={user?.profileImageURL}
                alt="user-image"
                height={40}
                width={40}
              />
            )}
            <div>
              <h3 className="text-sm font-bold">
                {user.firstName} {user.lastName}
              </h3>
              <h3 className="text-xs text-gray-500">{user.email}</h3>
            </div>
          </div>
        )}
      </div>
      <div className="col-span-5 border-r-[0.01px] border-l-[0.01px] h-screen overflow-y-scroll no-scrollbar  border-gray-700">
        <div className="sticky top-0 flex items-center justify-center h-10 bg-slate-900 text-white z-10 shadow-md ">
          <div className="flex items-center gap-3 p-4">
            <FaXTwitter className="text-3xl text-[#1d9bf0]" />

            <span className="text-xl font-medium">See What’s Happening</span>
          </div>
        </div>

        {tweets?.map((tweet) =>
          tweet ? <FeedCard key={tweet?.id} data={tweet as Tweet} /> : null
        )}
      </div>
      <div className="col-span-3 p-5 ">
        {user && (
          <div className="ml-8 bottom-5 border-gray-700 border w-80 rounded-lg px-3 py-4 flex flex-col gap-2">
            <div className="flex items-start gap-2">
              {user && user.profileImageURL && (
                <Image
                  className="rounded-full"
                  src={user?.profileImageURL}
                  alt="user-image"
                  height={40}
                  width={40}
                />
              )}

              <textarea
                className="textarea-auto-resize no-scrollbar"
                placeholder="Join the conversation"
                rows={2}
                value={content}
                onChange={handleInputChange}
              ></textarea>
            </div>

            <div className="flex justify-between items-center gap-2 mt-2">
              <BiImageAlt
                onClick={handleSelectImage}
                className="text-xl cursor-pointer transition-all"
              />
              <button
                onClick={handleCreateTweet}
                className="bg-[#1d9bf0] font-semibold text-sm py-2 px-4 rounded-full"
              >
                Post
              </button>
            </div>
          </div>
        )}

        {!user && (
          <div className="border-gray-700 border rounded-lg p-3">
            <h1 className=" text-xl font-bold  ">New to X?</h1>
            <p className="text-xs w-full mb-3 mt-2  text-gray-500">
              Sign in now to get your own personalized timeline!
            </p>

            <GoogleLogin onSuccess={handleLoginWithGoogle} />

            <p className="text-xs w-full mt-4  text-gray-500">
              By signing up, you agree to the Terms of service and Privacy
              Policy,including Cookie use.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
