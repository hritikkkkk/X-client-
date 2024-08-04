import { useRouter } from "next/router";
import Image from "next/image";
import type { GetServerSideProps, NextPage } from "next";
import { BsArrowLeftShort } from "react-icons/bs";
import { Tweet, User } from "@/gql/graphql";
import { graphqlClient } from "@/client/api";
import { getUserByIdQuery } from "@/graphql/query/user";
import FeedCard from "@/components/feedcards";
import TwitterLayout from "@/components/feedcards/Layout/twitterLayout";
import {
  followUserMutation,
  unfollowUserMutation,
} from "@/graphql/mutation/user";
import { useCallback, useMemo, useState } from "react";
import { useCurrentUser } from "@/hooks/user";
import { useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";

interface ServerProps {
  userInfo?: User;
}
interface Follower {
  id: string;
}

const UserProfilePage: NextPage<ServerProps> = (props) => {
  const router = useRouter();
  const { user: currentUser } = useCurrentUser();
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const amIFollowing = useMemo(() => {
    if (!props.userInfo?.id || !currentUser?.following) return false;

    return currentUser?.following.some((follower: Follower | null) => {
      return follower !== null && follower.id === props.userInfo?.id;
    });
  }, [currentUser?.following, props.userInfo?.id]);

  const handleFollowUser = useCallback(async () => {
    if (!props?.userInfo?.id) {
      toast.error("User information is not available");
      return;
    }

    try {
      await graphqlClient.request(followUserMutation, {
        to: props?.userInfo?.id,
      });
      queryClient.invalidateQueries({ queryKey: ["current-user"] });
      toast.success(
        `You are now following ${props?.userInfo?.firstName} ${props?.userInfo?.lastName}`
      );
    } catch (error: any) {
      if (error?.response?.errors) {
        const graphqlError = error.response.errors[0];
        if (
          graphqlError.extensions?.code === "INTERNAL_SERVER_ERROR" &&
          graphqlError.message === "You are not authenticated"
        ) {
          toast.error("You are not authenticated. Please log in.");
          console.error("Error: You are not authenticated:", graphqlError);
        } else {
          toast.error("An unexpected error occurred. Please try again.");
          console.error("GraphQL Error:", graphqlError);
        }
      } else {
        toast.error("Error following user. Please try again.");
        console.error("Error following user:", error);
      }
    }
  }, [props?.userInfo?.id, props?.userInfo?.firstName, queryClient]);

  const handleUnfollowUser = useCallback(async () => {
    if (!props?.userInfo?.id) {
      toast.error("User information is not available");
      return;
    }

    try {
      await graphqlClient.request(unfollowUserMutation, {
        to: props?.userInfo.id,
      });
      queryClient.invalidateQueries({ queryKey: ["current-user"] });
      setIsModalOpen(false);
      toast.success(
        `You have unfollowed ${props?.userInfo.firstName} ${props?.userInfo?.lastName}`
      );
    } catch (error: any) {
      if (error?.response?.errors) {
        const graphqlError = error.response.errors[0];
        if (
          graphqlError.extensions?.code === "INTERNAL_SERVER_ERROR" &&
          graphqlError.message === "You are not authenticated"
        ) {
          toast.error("You are not authenticated. Please log in.");
          console.error("Error: You are not authenticated:", graphqlError);
        } else {
          toast.error("An unexpected error occurred. Please try again.");
          console.error("GraphQL Error:", graphqlError);
        }
      } else {
        toast.error("Error unfollowing user. Please try again.");
        console.error("Error unfollowing user:", error);
      }
    }
  }, [props?.userInfo?.id, props?.userInfo?.firstName, queryClient]);

  const openModal = useCallback(() => setIsModalOpen(true), []);
  const closeModal = useCallback(() => setIsModalOpen(false), []);

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
              <div className="flex items-center justify-between space-x-8 w-full">
                <div className="flex gap-4 mt-2 text-sm text-gray-400">
                  <span>{props.userInfo?.followers?.length} followers</span>
                  <span>{props.userInfo?.following?.length} following</span>
                </div>
                <div className="ml-auto">
                  {currentUser?.id !== props.userInfo?.id && (
                    <>
                      {amIFollowing ? (
                        <button
                          onClick={openModal}
                          className="bg-white text-black px-3 py-1 rounded-full text-sm"
                        >
                          Following
                        </button>
                      ) : (
                        <button
                          onClick={handleFollowUser}
                          className="bg-white text-black px-3 py-1 rounded-full text-sm"
                        >
                          Follow
                        </button>
                      )}
                    </>
                  )}
                  {isModalOpen && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
                      <div className="bg-black rounded-lg p-6 max-w-md mx-auto shadow-lg">
                        <h3 className="text-lg font-semibold mb-2">
                          Unfollow @{props?.userInfo?.firstName}
                          {props?.userInfo?.lastName}?
                        </h3>
                        <p className="text-slate-400 mb-4">
                          Their posts will no longer show up in your For You
                          timeline. You can still view their profile, unless
                          their posts are protected.
                        </p>
                        <div className="flex justify-end space-x-4">
                          <button
                            onClick={closeModal}
                            className="px-4 py-2 bg-gray-100 text-gray-800 rounded-full hover:bg-green-700 transition-colors duration-200 ease-in-out"
                          >
                            Cancel
                          </button>
                          <button
                            onClick={handleUnfollowUser}
                            className="px-4 py-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors duration-200 ease-in-out"
                          >
                            Unfollow
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
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
