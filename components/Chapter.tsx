import { useState } from "react";
import YouTube from "react-youtube";
import {
  HiPlay,
  HiPause,
  HiLockClosed,
  HiOutlineClock,
  HiCheckCircle,
} from "react-icons/hi";
import CircularProgress from "@mui/material/CircularProgress";
import styles from "../styles/Videos.module.scss";

type ChapterType = {
  title: string;
  timeStart: string;
  duration: number;
  status: string;
  progression: number;
  isCompleted: boolean;
};

type Props = {
  chapter: ChapterType;
  currentTime: number;
  player: YouTube["internalPlayer"];
  startChapter: (chapter: ChapterType) => void;
  globalPlayerState: number;
  setGlobalPlayerState: (globalPlayerState: number) => void;
};

const formatTime = (time: number): string => {
  const formatedTime = new Date(time * 1000)
    .toISOString()
    .split("T")[1]
    .split(".")[0];
  if (time < 3600) {
    return formatedTime.substring(3);
  }
  return formatedTime;
};

const getProgress = (currentTime: number, timeStart: number) => {
  return currentTime - timeStart > 0 ? currentTime - timeStart : 0;
};

const convertTimecodeToSeconds = (timecode: string) => {
  const timeSplit = timecode.split(":");
  if (timeSplit.length === 3) {
    return (
      Number(timeSplit[0]) * 3600 +
      Number(timeSplit[1]) * 60 +
      Number(timeSplit[2])
    );
  }
  return Number(timeSplit[0]) * 60 + Number(timeSplit[1]);
};

const Chapter = (props: Props) => {
  //   const [playerState, setPlayerState] = useState(2);
  // const [value, setValue] = useState(0);

  const isActiveChapter =
    props.currentTime <
      convertTimecodeToSeconds(props.chapter.timeStart) +
        props.chapter.duration &&
    props.currentTime >= convertTimecodeToSeconds(props.chapter.timeStart);

  const playChapter = () => {
    if (isActiveChapter) {
      props.player.playVideo();
      props.setGlobalPlayerState(1);
    }
    // props.startChapter(props.chapter);
    props.player.seekTo(
      convertTimecodeToSeconds(props.chapter.timeStart) +
        (props.chapter.progression * props.chapter.duration) / 100
    );
    props.player.playVideo();
  };

  const pauseChapter = () => {
    if (isActiveChapter) {
      props.player.pauseVideo();
      props.setGlobalPlayerState(2);
    }
    // props.startChapter(props.chapter);
    // props.player.pauseVideo();
  };

  //   const value =
  //     (getProgress(
  //       props.currentTime,
  //       convertTimecodeToSeconds(props.chapter.timeStart)
  //     ) /
  //       props.chapter.duration) *
  //     100;
  // console.log(props.chapter.progression);

  // useEffect(() => {
  //   // console.log("pause");
  //   // setValue(progressValue);
  //   // props.chapter.progression = value;
  //   // console.log(props.chapter.progression);
  // }, [props.globalPlayerState]);

  // console.log(value);

  const chapterProgress = () => {
    if (isActiveChapter) {
      const value =
        (getProgress(
          props.currentTime,
          convertTimecodeToSeconds(props.chapter.timeStart)
        ) /
          props.chapter.duration) *
        100;
      // if (value > 0) {
      //   props.chapter.status = "ongoing";
      // }
      if (value <= 100) {
        props.chapter.progression = value;
      }
      if (value >= 98) {
        props.chapter.isCompleted = true;
        props.chapter.status = "completed";
      }
      return value;
    }
    return props.chapter.progression;
  };

  return (
    <div className={styles["chapter-container"]}>
      <div className={styles["chapter-progress"]}>
        <CircularProgress
          variant='determinate'
          size={50}
          value={
            props.chapter.status === "locked"
              ? 0
              : chapterProgress() /* value < 100 ? value : 100 */
          }
        />
        {props.chapter.status === "locked" ? (
          <HiLockClosed
            size={"20px"}
            className={styles["player-icon-locked"]}
          />
        ) : props.chapter.progression >= 99 || props.chapter.isCompleted ? (
          <HiCheckCircle size={"50px"} />
        ) : props.globalPlayerState === 2 ? (
          <HiPlay size={"50px"} onClick={playChapter} />
        ) : props.globalPlayerState === 1 && isActiveChapter ? (
          <HiPause size={"50px"} onClick={pauseChapter} />
        ) : (
          <HiPlay size={"50px"} onClick={playChapter} />
        )}

        {/* <CircularProgressbarWithChildren
            className={styles["circular-progressbar"]}
            value={
              props.chapter.status === "locked"
                ? 0
                : getProgress(
                    props.currentTime,
                    convertTimecodeToSeconds(props.chapter.timeStart)
                  )
            }
            maxValue={props.chapter.duration}>
            {props.chapter.status === "locked" ? (
              <HiLockClosed size={"20px"} />
            ) : playerState === 2 ? (
              <HiPlay size={"50px"} onClick={playChapter} />
            ) : (
              <HiPause
                size={"50px"}
                onClick={pauseChapter}
                style={{ position: "relative" }}
              />
            )}
          </CircularProgressbarWithChildren> */}
      </div>
      <span
        onClick={() =>
          props.chapter.status === "locked"
            ? props.startChapter(props.chapter)
            : props.player.seekTo(
                convertTimecodeToSeconds(props.chapter.timeStart) +
                  (props.chapter.progression * props.chapter.duration) / 100
              )
        }>
        <h4>
          {props.chapter.timeStart} {props.chapter.title}
        </h4>
        <p>
          <HiOutlineClock /> {formatTime(props.chapter.duration)}
          {/* {props.chapter.status} */}
        </p>
      </span>
    </div>
  );
};

export default Chapter;
