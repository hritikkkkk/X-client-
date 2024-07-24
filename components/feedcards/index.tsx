import React from "react";
import Image from "next/image";
import { BiMessageRounded, BiUpload } from "react-icons/bi";
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
    <div className="border border-r-0 border-l-0 border-b-0 border-gray-600 p-5 hover:bg-slate-900 transition-all cursor-pointer">
      <div className="grid grid-cols-12 gap-3">
        <div className="col-span-1">
          {data.author?.profileImageURL && (
            <Image
              className="rounded-full"
              src={data.author.profileImageURL}
              alt="user-image"
              height={50}
              width={50}
            />
          )}
        </div>
        <div className="col-span-11">
          <h5 className="text-sm font-semibold">
            {data.author?.firstName} {data.author?.lastName}
          </h5>
          <p className="text-sm font-light">{data.content}</p>

          <div className="flex justify-between mt-5 text-lg  p-2 w-[100%]">
            <div>
              <BiMessageRounded />
            </div>
            <div>
              <FaRetweet />
            </div>
            <div>
              <AiOutlineHeart />
            </div>
            <div>
              <PiBookmarkSimple />
            </div>
            <div>
              <RiShare2Line />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FeedCard;
