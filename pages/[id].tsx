import { useRouter } from "next/router";
import Image from "next/image";
import type { GetServerSideProps, NextPage } from "next";
import { BsArrowLeftShort } from "react-icons/bs";
import { Tweet, User } from "@/gql/graphql";
import { graphqlClient } from "@/client/api";
import { getUserByIdQuery } from "@/graphql/query/user";
import FeedCard from "@/components/feedcards";
import TwitterLayout from "@/components/feedcards/Layout/twitterLayout";

interface ServerProps {
  userInfo?: User;
}

const UserProfilePage: NextPage<ServerProps> = (props) => {
  const router = useRouter();

  return (
    <div>
      <TwitterLayout>
        <nav className="sticky top-0 z-10 bg-black flex items-center gap-8 py-2 px-4 border-b border-gray-700">
          <button onClick={() => router.back()} aria-label="Go back">
            <BsArrowLeftShort className="text-3xl text-white" />
          </button>
          <div>
            <h1 className="text-xl font-bold text-white">
              {props.userInfo?.firstName} {props.userInfo?.lastName}
            </h1>
            <h2 className="text-sm font-semibold text-gray-500">
              {props.userInfo?.tweets?.length} Posts
            </h2>
          </div>
        </nav>

        <div className="p-6 border-b border-slate-800 bg-black text-white">
          <div className="flex items-center gap-4">
            {props.userInfo?.profileImageURL && (
              <Image
                src={props.userInfo?.profileImageURL}
                alt="user-image"
                className="rounded-full"
                width={80}
                height={80}
              />
            )}
            <div>
              <h1 className="text-2xl font-bold">
                {props.userInfo?.firstName} {props.userInfo?.lastName}
              </h1>
             
            </div>
          </div>
        </div>

        {/* Tweets Section */}
        <div className="bg-black">
          {props.userInfo?.tweets?.map((tweet) => (
            <FeedCard data={tweet as Tweet} key={tweet?.id} />
          ))}
        </div>
      </TwitterLayout>
    </div>
  );
};

export const getServerSideProps: GetServerSideProps<ServerProps> = async (
  context
) => {
  const id = context.query.id as string | undefined;

  if (!id) return { notFound: true, props: { userInfo: undefined } };

  const userInfo = await graphqlClient.request(getUserByIdQuery, { id });

  if (!userInfo?.getUserById) return { notFound: true };

  return {
    props: {
      userInfo: userInfo.getUserById as User,
    },
  };
};

export default UserProfilePage;
