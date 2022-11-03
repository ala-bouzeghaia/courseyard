import { useEffect, useRef, useState } from "react";
import axios from "axios";
import YouTube, { YouTubeProps } from "react-youtube";
import LinearProgress from "@mui/material/LinearProgress";
import { AiOutlineUnorderedList } from "react-icons/ai";
import { CgNotes } from "react-icons/cg";
import { BiPlusCircle, BiXCircle } from "react-icons/bi";
import styles from "../styles/Videos.module.scss";
import Note from "../components/Note";
import Chapter from "../components/Chapter";
import { useVideo } from "../context/VideoContext";

// const API_KEY = "AIzaSyDL9vaXahEvZHo8C40h4DvTMq8YpNfqf1o";
// const API_KEY = process.env.NEXT_PUBLIC_API_KEY as string;

const getVideoDescription = async (id: string): Promise<string> => {
  const res = await axios.get(
    `https://www.googleapis.com/youtube/v3/videos?part=snippet&key=${process.env.NEXT_PUBLIC_API_KEY}&id=${id}`
  );
  const data = await res.data.items[0].snippet.description;
  console.log("data", data);
  return data;
};

const pattern =
  /([0-9][0-9]:[0-9][0-9]:[0-9][0-9])|([0-9]:[0-9][0-9]:[0-9][0-9])|([0-9][0-9]:[0-9][0-9])|([0-9]:[0-9][0-9])/;

const splitDescription = (description: string) => {
  const res = description.split("\n");
  const pattern =
    /([0-9][0-9]:[0-9][0-9]:[0-9][0-9])|([0-9]:[0-9][0-9]:[0-9][0-9])|([0-9][0-9]:[0-9][0-9])|([0-9]:[0-9][0-9])/;
  const array: string[] = [];
  res.map((elt) =>
    elt.match(pattern) !== null
      ? array.push(elt.match(pattern)?.input as string)
      : null
  );
  return array;
};

const convertTimecodeToSeconds = (timecode: string) => {
  const timeSplit = timecode.split(" ")[0].split(":");
  // console.log(timeSplit);
  if (timeSplit.length >= 3) {
    return (
      Number(timeSplit[0]) * 3600 +
      Number(timeSplit[1]) * 60 +
      Number(timeSplit[2])
    );
  }
  return Number(timeSplit[0]) * 60 + Number(timeSplit[1]);
};

const formatSecondsToTimecode = (time: number): string => {
  const formatedTime = new Date(time * 1000)
    .toISOString()
    .split("T")[1]
    .split(".")[0];
  if (time < 3600) {
    return formatedTime.substring(3);
  }
  return formatedTime;
};

type ChapterType = {
  title: string;
  timeStart: string;
  duration: number;
  status: string;
  progression: number;
  isCompleted: boolean;
};

const Videos = () => {
  const [chapters, setChapters] = useState([] as ChapterType[]);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [globalPlayerState, setGlobalPlayerState] = useState(2);
  const [openChaptersSideBar, setOpenChaptersSideBar] = useState(true);
  const [openNoteTextarea, setOpenNoteTextarea] = useState(false);
  // const [note, setNote] = useState("");
  const [notesList, setNotesList] = useState([] as Note[]);
  const playerRef = useRef({} as YouTube);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const { videoId } = useVideo();

  // console.log(playerRef.current.internalPlayer.getCurrentTime());
  // console.log(convertTimecodeToSeconds(timestamps));
  // console.log(playerRef.current.internalPlayer.getDuration());

  const goToTimecodeFromChapter = (timecode: string) => {
    const time = convertTimecodeToSeconds(timecode);
    playerRef.current.internalPlayer.seekTo(time);
  };

  const getChapterDuration = (timeStart: string, timeEnd: string) => {
    return (
      convertTimecodeToSeconds(timeEnd) - convertTimecodeToSeconds(timeStart)
    );
  };

  const startChapter = (chapter: ChapterType) => {
    goToTimecodeFromChapter(chapter.timeStart);
    chapter.status = "ongoing";
  };

  const getTimeFromDescription = (description: string): string => {
    return description.match(pattern) !== null
      ? description.match(pattern)![0]
      : description.includes(" - ")
      ? description.split(" - ")[0]
      : description.split(" ")[0];
  };

  const getTitleFromDescription = (description: string): string => {
    const matchTime = description.match(pattern);
    if (matchTime !== null) {
      const matchText = (matchTime?.input as string).match(/[a-zA-Z]/);
      if (matchText !== null) {
        return description.slice(matchText.index);
      }
    }
    return "";
  };

  useEffect(() => {
    if (videoId !== "") {
      const storedCourse = JSON.parse(
        localStorage.getItem("courses") as string
      ).filter((elt: { videoId: string }) => elt.videoId === videoId)[0];

      const storedNotes = storedCourse?.notes as Note[];
      storedNotes && storedNotes?.length !== 0
        ? setNotesList(storedNotes)
        : setNotesList([]);

      const storedChapters = storedCourse?.chapters as ChapterType[];
      storedChapters && storedChapters?.length !== 0
        ? setChapters(storedChapters)
        : playerRef.current.internalPlayer
            .getDuration()
            .then((duration: number) => {
              setDuration(duration);
              getVideoDescription(videoId).then((res) =>
                /* storedChapters?.length !== 0
              ? setChapters(storedChapters)
              :  */
                splitDescription(res).map((elt, idx, arr) => {
                  // const timeStart =
                  //   elt.match(pattern) !== null
                  //     ? elt.match(pattern)![0]
                  //     : elt.includes(" - ")
                  //     ? elt.split(" - ")[0]
                  //     : elt.split(" ")[0];
                  const timeStart = getTimeFromDescription(elt);
                  console.log("timeStart", timeStart);
                  console.log(elt.match(pattern));
                  console.log(convertTimecodeToSeconds(timeStart));
                  console.log("title", getTitleFromDescription(elt));
                  const title =
                    getTitleFromDescription(elt); /* elt.includes(" - ")
                    ? elt.split(" - ")[1]
                    : elt.split(" ").slice(1).join(" "); */
                  setChapters((prev) => [
                    ...prev,
                    {
                      timeStart,
                      title,
                      duration: arr[idx + 1]
                        ? getChapterDuration(
                            timeStart,
                            getTimeFromDescription(
                              arr[idx + 1]
                            ) /* arr[idx + 1].split(" - ")[0] */
                          )
                        : duration - convertTimecodeToSeconds(timeStart),
                      status: "locked",
                      progression: 0,
                      isCompleted: false,
                    },
                  ]);
                })
              );
            });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const duration = playerRef.current.internalPlayer?.getDuration();
    const completedChapters = chapters.filter((chapter) => chapter.isCompleted);
    const globalProgress = (completedChapters.length * 100) / chapters.length;
    const progression =
      chapters.length !== 0 ? globalProgress : (currentTime * 100) / duration;

    const courseList = JSON.parse(localStorage.getItem("courses") as string);
    const newCourseList = courseList.map((elt: { videoId: string }) =>
      elt.videoId === videoId
        ? {
            ...elt,
            progression: progression ?? 0,
            chapters,
            notes: notesList,
          }
        : elt
    );
    localStorage.setItem("courses", JSON.stringify(newCourseList));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chapters, notesList]);

  useEffect(() => {
    // console.log(currentTime);
    if (videoId !== "") {
      const interval = setInterval(() => {
        playerRef.current.internalPlayer
          .getCurrentTime()
          .then((res: number) => {
            setCurrentTime(res);
          });
      }, 500);

      const completedChapters = chapters.filter(
        (chapter) => chapter.isCompleted
      );

      const globalProgress = (completedChapters.length * 100) / chapters.length;
      const progression =
        chapters.length !== 0 ? globalProgress : (currentTime * 100) / duration;

      const courseList = JSON.parse(localStorage.getItem("courses") as string);
      const newCourseList = courseList.map((elt: { videoId: string }) =>
        elt.videoId === videoId
          ? {
              ...elt,
              progression: progression ?? 0,
              chapters,
              notes: notesList,
            }
          : elt
      );
      localStorage.setItem("courses", JSON.stringify(newCourseList));

      // setActiveChapter(chapters.filter(
      //   (chapter) =>
      //     currentTime <
      //       convertTimecodeToSeconds(chapter.timeStart) + chapter.duration &&
      //     currentTime >= convertTimecodeToSeconds(chapter.timeStart)
      // )[0])
      // if(activeChapter.progression >= 98){
      //   setActiveChapter(prev => {...prev, status: "completed"})
      // };
      // if(activeChapter.progression > 0){
      //   setActiveChapter(prev => {...prev, "status": "completed"})
      // }

      // if(activeChapter.progression >= 98) activeChapter.status

      return () => {
        clearInterval(interval);
        // setProgression(chapters ? globalProgress : currentTime / duration);
      };
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentTime]);

  useEffect(() => {
    // if(playerRef.current.internalPlayer.gerPlayerState === 1)
    const interval = setInterval(() => {
      // eslint-disable-next-line react-hooks/exhaustive-deps
      activeChapter = chapters?.filter(
        (chapter) =>
          currentTime <
            convertTimecodeToSeconds(chapter.timeStart) + chapter.duration &&
          currentTime >= convertTimecodeToSeconds(chapter.timeStart)
      )[0];
      if (activeChapter) activeChapter.status = "ongoing";
    }, 500);

    // console.log(activeChapter);
    // if (activeChapter && activeChapter?.progression > 0) {
    //   activeChapter.status = "ongoing";
    // }
    return () => {
      clearInterval(interval);
    };
  }, [currentTime]);

  // useEffect(()=>{
  //   playerRef.current.internalPlayer.
  // },[])
  // const [activeChapter, setActiveChapter] = useState({} as ChapterType)
  let activeChapter: ChapterType;

  const onPlay: YouTubeProps["onPlay"] = () => {
    setGlobalPlayerState(1);
    activeChapter = chapters?.filter(
      (chapter) =>
        currentTime <
          convertTimecodeToSeconds(chapter.timeStart) + chapter.duration &&
        currentTime >= convertTimecodeToSeconds(chapter.timeStart)
    )[0];

    // activeChapter.status = "ongoing";
    // if (activeChapter.status !== "completed") {
    // }

    console.log(activeChapter);
    if (activeChapter) {
      activeChapter.status = "ongoing";
    }
  };
  const onPause: YouTubeProps["onPause"] = () => {
    setGlobalPlayerState(2);
  };

  // const playChapter = () => {
  //   playerRef.current.internalPlayer.playVideo();
  //   setPlayerState(1);
  // };
  // const pauseChapter = () => {
  //   playerRef.current.internalPlayer.pauseVideo();
  //   setPlayerState(2);
  // };

  const completedChapters = chapters?.filter((chapter) => chapter.isCompleted);
  const globalProgress =
    chapters.length !== 0
      ? (completedChapters?.length * 100) / chapters?.length
      : (currentTime * 100) / duration;

  const handleChaptersSideBarSize = () => {
    setOpenChaptersSideBar(!openChaptersSideBar);
  };

  const handleNoteTextarea = () => {
    setOpenNoteTextarea(!openNoteTextarea);
  };

  const handleSubmit = () => {
    const note = textareaRef.current?.value as string;
    if (note !== "") {
      setNotesList((prev) => [...prev, { timecode: currentTime, note }]);
      if (textareaRef.current !== null) textareaRef.current.value = "";
      setOpenNoteTextarea(false);
    }
  };

  const cancelNote = () => {
    if (textareaRef.current !== null) textareaRef.current.value = "";
    setOpenNoteTextarea(false);
  };

  useEffect(() => {
    if (window.innerWidth <= 500) {
      setOpenChaptersSideBar(false);
    }
  }, []);

  return (
    <>
      {videoId === "" ? (
        <div className={styles.alert}>
          <h2>ACCESS DENIED : </h2>
          <br />
          <h2>Please load a video in the courses section first</h2>
        </div>
      ) : (
        <div className={styles.container}>
          <div
            className={`${styles["chapters-list"]} ${
              styles[openChaptersSideBar ? "open" : "close"]
            }`}>
            <div className={styles["chapters-section-title"]}>
              <div>
                <h1>Chapters </h1>
                <AiOutlineUnorderedList
                  size={32}
                  onClick={handleChaptersSideBarSize}
                />
              </div>
              <p>
                Completed :{" "}
                {globalProgress > 0
                  ? globalProgress < 1
                    ? globalProgress.toPrecision(1)
                    : globalProgress.toPrecision(2)
                  : 0}
                %{" "}
              </p>
              <LinearProgress
                variant='determinate'
                value={globalProgress > 0 ? globalProgress : 0}
              />
            </div>

            {chapters.map((chapter, idx: number) => (
              <Chapter
                key={idx}
                chapter={chapter}
                currentTime={currentTime}
                startChapter={startChapter}
                player={playerRef.current.internalPlayer}
                globalPlayerState={globalPlayerState}
                setGlobalPlayerState={setGlobalPlayerState}
              />
            ))}
          </div>
          <div className={styles["video-container"]}>
            <h1>Videos</h1>

            <YouTube
              videoId={videoId}
              className={styles.player}
              opts={{ width: "100%", height: "100%" }}
              ref={playerRef}
              onPlay={onPlay}
              onPause={onPause}
            />
            <div className={styles["notes-container"]}>
              <div className={styles["notes-input"]}>
                <div>
                  <p onClick={handleNoteTextarea}>
                    <CgNotes size={25} />
                    <span>Take a note</span>
                  </p>
                  <div
                    className={`${styles.buttons} ${
                      styles[openNoteTextarea ? "show-buttons" : "hide-buttons"]
                    }`}>
                    <p onClick={handleSubmit}>
                      <BiPlusCircle size={18} /> <span>Add New Note</span>
                    </p>
                    <p onClick={cancelNote}>
                      <BiXCircle size={18} />
                      <span>Cancel</span>
                    </p>
                  </div>
                </div>

                <textarea
                  className={`${
                    styles[
                      openNoteTextarea ? "open-textarea" : "close-textarea"
                    ]
                  }`}
                  ref={textareaRef}
                />
              </div>
              <div className={styles["notes-list"]}>
                {notesList.map((elt, idx: number) => (
                  <>
                    {/* {console.log(idx)} */}
                    <Note
                      key={idx}
                      note={elt}
                      notesList={notesList}
                      setNotesList={setNotesList}
                      player={playerRef.current.internalPlayer}
                      openNoteTextarea={openNoteTextarea}
                      setOpenNoteTextarea={setOpenNoteTextarea}
                      textareaRef={textareaRef}
                      noteIndex={idx}
                    />
                  </>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Videos;
