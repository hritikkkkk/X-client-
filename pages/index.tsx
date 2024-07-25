import React from "react";

import FeedCard from "@/components/feedcards";

import { useGetAllTweets } from "@/hooks/tweet";
import { Tweet } from "@/gql/graphql";
import { FaXTwitter } from "react-icons/fa6";
import Twitterlayout from "@/components/feedcards/Layout/twitterLayout";

export default function Home() {
  const { tweets = [] } = useGetAllTweets();

  return (
    <Twitterlayout>
      <div>
        <div className="col-span-5 border-r-[0.01px] border-l-[0.01px] h-screen overflow-y-scroll no-scrollbar  border-gray-700">
          <div className="sticky top-0 flex items-center justify-center h-10 bg-slate-900 text-white z-10 shadow-md ">
            <div className="flex items-center gap-3 p-4">
              <FaXTwitter className="text-3xl text-[#1d9bf0]" />

              <span className=" hidden md:inline text-xl font-medium">See What’s Happening</span>
            </div>
          </div>

          {tweets?.map((tweet) =>
            tweet ? <FeedCard key={tweet?.id} data={tweet as Tweet} /> : null
          )}
        </div>
      </div>
    </Twitterlayout>
  );
}
