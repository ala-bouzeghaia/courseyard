// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from "next";

import axios, { AxiosError } from "axios";
import { getSession } from "next-auth/react";
import { getToken, JWT } from "next-auth/jwt";

// const secret = process.env.NEXTAUTH_SECRET;
// let accessToken: string;
//"https://www.googleapis.com/youtube/v3/subscriptions"
const getYTData = async (accessToken: string) => {
  try {
    const { data } = await axios.get(
      "https://www.googleapis.com/youtube/v3/playlists?part=snippet&mine=true",
      /* `https://www.googleapis.com/youtube/v3/subscriptions?part=snippet&mine=true&pageToken=${pageToken}&maxResults=50&key=${process.env.NEXT_PUBLIC_API_KEY}` */ {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    const selectedPlaylist = data.items.filter(
      (item: { snippet: { title: string } }) =>
        item.snippet.title === "courseyard"
    );

    if (selectedPlaylist.length !== 0) return selectedPlaylist[0];

    const res = await axios.post(
      "https://www.googleapis.com/youtube/v3/playlists?part=id,snippet",
      JSON.stringify({
        snippet: {
          title: "courseyard",
          description: "A playlist of selected courses",
        },
      }),
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
      }
    );
    return res.data;
  } catch (error) {
    if (error instanceof AxiosError) return error.response;
  }
};

const getPlaylistItem = async (accessToken: string, playlistId: string) => {
  try {
    const { data } = await axios.get(
      `https://www.googleapis.com/youtube/v3/playlistItems?part=id,snippet&playlistId=${playlistId}`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );
    return data.items;
  } catch (error) {
    if (error instanceof AxiosError) return error.response;
  }
};

const addPlaylistItem = async (
  accessToken: string,
  playlistId: string,
  videoId: string
) => {
  try {
    const { data } = await axios.post(
      "https://www.googleapis.com/youtube/v3/playlistItems?part=id,snippet",
      JSON.stringify({
        snippet: {
          playlistId,
          resourceId: {
            kind: "youtube#video",
            videoId,
          },
        },
      }),
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
      }
    );

    return data;
  } catch (error) {
    if (error instanceof AxiosError) return error.response;
  }
};

const deletePlaylistItem = async (accessToken: string, videoId: string) => {
  try {
    await axios.delete(
      `https://www.googleapis.com/youtube/v3/playlistItems?id=${videoId}`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );
  } catch (error) {
    // console.log(error);
    if (error instanceof AxiosError) return error.response;
  }
};

// const getYoutubePlaylist = async () => {
//   const { data } = await axios.post(
//     "https://www.googleapis.com/youtube/v3/playlists?part=id,snippet",
//     JSON.stringify({ snippet: { title: "ilearn" } }),
//     {
//       headers: {
//         Authorization: `Bearer ${accessToken}`,
//         "Content-Type": "application/json",
//       },
//     }
//   );
//   return data;
// };

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const session = await getSession({ req });
  if (!session) {
    return res.status(401).end();
  }
  const token = await getToken({ req });
  const accessToken = token?.accessToken as string;

  if (req.method === "GET") {
    const playlist = await getYTData(accessToken);
    const playlistId = playlist.id;
    const playlistItems = await getPlaylistItem(accessToken, playlistId);
    res.send(playlistItems);
  }

  if (req.method === "POST") {
    const playlist = await getYTData(accessToken);
    const playlistId = playlist.id;
    const video = await addPlaylistItem(accessToken, playlistId, req.body);
    res.send(video);
  }

  // console.log("tok", tok);

  // console.log("access_token", accessToken);
  // accessToken =
  //   "ya29.a0Aa4xrXNZA2n9TkcnF0tVwgntzxeX6Sz69KVv09-cRAaApexN---v6klyHVHAI_J3ieqpHL_q8DKNJ3M7oxsOPkDgBLB3xXB2LNBtdlFzIcZKpQU9olBzJMz8OjgRRf6Rs9T36PuD4dttAMT1w-sGNTN3V_T2aCgYKATASARISFQEjDvL9b-1UKFvTm2Yx77vbr8V4QQ0163";

  // const data = await getYoutubePlaylist();
  // console.log(data);
  // const playlistId = playlist.id;
  // const videoId = "ML743nrkMHw";
  // const video = await addPlaylistItem(playlistId, videoId);

  // console.log("video", video);Q_6OZd6FFYg

  // const del = await deletePlaylistItem(
  //   "UExfM0dISXk3TWhyTTJrVm1oMFQxcVAwcllCNDJ4T1p0ZS4xMkVGQjNCMUM1N0RFNEUx"
  // );
  // console.log(del);
};

export default handler;
