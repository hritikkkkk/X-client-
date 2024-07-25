import React from "react";
import Image from "next/image";
import { BiMessageRounded } from "react-icons/bi";
import { FaRetweet } from "react-icons/fa6";
import { AiOutlineHeart } from "react-icons/ai";
import { RiShare2Line } from "react-icons/ri";
import { PiBookmarkSimple } from "react-icons/pi";
import { Tweet } from "@/gql/graphql";

interface FeedCardProps {
  data: Tweet;
}

const FeedCard: React.FC<FeedCardProps> = (props) => {
  const { data } = props;
  return (
    <div className="border-b border-gray-600 p-4 sm:p-5 hover:bg-gray-800 transition-all cursor-pointer">
      <div className="flex flex-col sm:flex-row items-start sm:items-start gap-4">
        <div className="flex-shrink-0">
          {data.author?.profileImageURL ? (
            <Image
              className="rounded-full border-2 border-gray-500"
              src={data.author.profileImageURL}
              alt="user-image"
              height={40} 
              width={40}   
            />
          ) : (
            <div className="bg-gray-700 text-white rounded-full h-10 w-10 flex items-center justify-center text-sm">
              {data.author?.firstName?.charAt(0)}
            </div>
          )}
        </div>
        <div className="flex-1">
          <h5 className="text-base font-bold text-white">
            {data.author?.firstName} {data.author?.lastName}
          </h5>
          <p className="text-sm text-gray-400 mt-1">{data.content}</p>
          <div className="flex flex-wrap gap-2 mt-4 text-xl text-gray-400 hover:text-white transition-all">
            <div className="hover:bg-gray-700 p-2 rounded-full">
              <BiMessageRounded className="transition-transform hover:scale-110" />
            </div>
            <div className="hover:bg-gray-700 p-2 rounded-full">
              <FaRetweet className="transition-transform hover:scale-110" />
            </div>
            <div className="hover:bg-gray-700 p-2 rounded-full">
              <AiOutlineHeart className="transition-transform hover:scale-110" />
            </div>
            <div className="hover:bg-gray-700 p-2 rounded-full">
              <PiBookmarkSimple className="transition-transform hover:scale-110" />
            </div>
            <div className="hover:bg-gray-700 p-2 rounded-full">
              <RiShare2Line className="transition-transform hover:scale-110" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FeedCard;


