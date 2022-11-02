import { createContext, ReactNode, useContext, useState } from "react";

type videoContextType = {
  videoId: string;
  setVideoId: (value: React.SetStateAction<string>) => void;
  progression: number;
  setProgression: (value: React.SetStateAction<number>) => void;
};

const videoContextDefaultValues: videoContextType = {
  videoId: "",
  setVideoId: () => {},
  progression: 0,
  setProgression: () => {},
};

const VideoContext = createContext<videoContextType>(videoContextDefaultValues);

export const useVideo = () => {
  return useContext(VideoContext);
};

type Props = {
  children: ReactNode;
};
export const VideoProvider = ({ children }: Props) => {
  const [videoId, setVideoId] = useState("");
  const [progression, setProgression] = useState(0);

  return (
    <VideoContext.Provider
      value={{ videoId, setVideoId, progression, setProgression }}>
      {children}
    </VideoContext.Provider>
  );
};
