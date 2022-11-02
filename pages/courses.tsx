import axios from "axios";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useSession } from "next-auth/react";
import { useVideo } from "../context/VideoContext";
import styles from "../styles/Courses.module.scss";

type Course = {
  channelTitle: string;
  title: string;
  thumbnails: {
    standard: { url: string };
    default: { url: string };
    medium: { url: string };
  };
  duration: string;
  videoId: string;
  progression: number;
};
// mTz0GXj8NN0

const suggestions: string[] = [
  "kUMe1FH4CHE",
  "OXGznpKZ_sA",
  "jS4aFq5-91M",
  "eWRfhZUzrAc",
  "w7ejDZ8SWv8",
];

const getVideoDescription = async (videoId: string): Promise<Course> => {
  const resSnippet = await axios.get(
    `https://www.googleapis.com/youtube/v3/videos?part=snippet&key=${process.env.NEXT_PUBLIC_API_KEY}&id=${videoId}`
  );
  const dataSnippet = await resSnippet.data.items[0].snippet;
  const resContentDetails = await axios.get(
    `https://www.googleapis.com/youtube/v3/videos?part=contentDetails&key=${process.env.NEXT_PUBLIC_API_KEY}&id=${videoId}`
  );
  const dataContentDetails = await resContentDetails.data.items[0]
    .contentDetails;
  console.log("data", { ...dataSnippet, ...dataContentDetails });
  return { ...dataSnippet, ...dataContentDetails };
};

const formatDurationToTimecode = (duration: string): string => {
  const hoursSplit: string[] = duration.split("PT")[1].split("H");
  const hours: string =
    hoursSplit.length === 2
      ? hoursSplit[0].length === 1
        ? "0" + hoursSplit[0]
        : hoursSplit[0]
      : "";

  const minutesSplit: string[] =
    hoursSplit.length === 2
      ? hoursSplit[1].split("M")
      : hoursSplit[0].split("M");
  const minutes: string =
    minutesSplit[0].length === 1 ? "0" + minutesSplit[0] : minutesSplit[0];

  const secondsSplit: string[] = minutesSplit[1].split("S");
  const seconds: string =
    secondsSplit[0] === ""
      ? "00"
      : secondsSplit[0].length === 1
      ? "0" + secondsSplit[0]
      : secondsSplit[0];

  return hours.length !== 0
    ? `${hours}:${minutes}:${seconds}`
    : `${minutes}:${seconds}`;
};
// const getInitialState = (): Course[] =>
//   JSON.parse(localStorage.getItem("courses") as string);
// console.log(getInitialState);

const getYoutubePlaylistItems = async () => {
  const { data } = await axios.get("/api/youtubePlaylist", {
    withCredentials: true,
  });
  return data;
};

const Courses = () => {
  const [courseList, setCourseList] = useState<Course[]>([]);
  const [youtubeId, setYoutubeId] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  // const { progression } = useVideo();
  const [suggestionList, setSuggestionList] = useState<Course[]>([]);
  const [isSuggestionDisplayed, setIsSuggestionDisplayed] = useState(false);
  const { data: session } = useSession();

  const handleSubmit = () => {
    if (inputRef.current !== null && inputRef.current.value !== "") {
      const idFromUrl = inputRef.current?.value
        .split("?v=")[1]
        .split("&")[0] as string;
      setYoutubeId(idFromUrl);

      inputRef.current.value = "";
    }
  };

  // "https://www.youtube.com/watch?v=mTz0GXj8NN0&t=1111s"

  useEffect(() => {
    console.log(typeof JSON.parse(localStorage.getItem("courses") as string));
    console.log(JSON.parse(localStorage.getItem("courses") as string));
    console.log(courseList);

    setYoutubeId("");
  }, [courseList]);

  useEffect(() => {
    if (session) {
      getYoutubePlaylistItems().then((res) =>
        res.map((item: { snippet: { resourceId: { videoId: string } } }) => {
          const youtubeId = item.snippet.resourceId.videoId;
          getVideoDescription(youtubeId).then((res) => {
            console.log("playkdsvkjdv", res);
            setCourseList((prev) =>
              prev.filter((course) => course.videoId === youtubeId).length === 0
                ? [...prev, { ...res, videoId: youtubeId, progression: 0 }]
                : prev
            );

            localStorage.getItem("courses") !== null &&
              JSON.parse(localStorage.getItem("courses") as string).filter(
                (course: Course) => course.videoId === youtubeId
              ).length === 0 &&
              localStorage.setItem(
                "courses",
                JSON.stringify(
                  localStorage.getItem("courses") !== null &&
                    typeof localStorage.getItem("courses") !== "number"
                    ? [
                        ...JSON.parse(
                          localStorage.getItem("courses") as string
                        ),
                        {
                          ...res,
                          videoId: youtubeId,
                          progression: 0,
                        },
                      ]
                    : [{ ...res, videoId: youtubeId, progression: 0 }]
                )
              );
          });
        })
      );
    }
    if (localStorage.getItem("courses") !== null) {
      setCourseList([...JSON.parse(localStorage.getItem("courses") as string)]);
      console.log(courseList);
    }
  }, []);

  useEffect(() => {
    if (youtubeId !== "") {
      getVideoDescription(youtubeId).then((res) => {
        setCourseList((prev) =>
          prev.filter((course) => course.videoId === youtubeId).length === 0
            ? [...prev, { ...res, videoId: youtubeId, progression: 0 }]
            : prev
        );

        localStorage.getItem("courses") !== null &&
          JSON.parse(localStorage.getItem("courses") as string).filter(
            (course: Course) => course.videoId === youtubeId
          ).length === 0 &&
          localStorage.setItem(
            "courses",
            JSON.stringify(
              localStorage.getItem("courses") !== null &&
                typeof localStorage.getItem("courses") !== "number" /* &&
              JSON.parse(localStorage.getItem("courses") as string).filter(
                (course: Course) => course.videoId === youtubeId
              ).length === 0 */
                ? [
                    ...JSON.parse(localStorage.getItem("courses") as string),
                    {
                      ...res,
                      videoId: youtubeId,
                      progression: 0,
                    },
                  ]
                : [{ ...res, videoId: youtubeId, progression: 0 }]
            )
          );
      });
    }
  }, [youtubeId]);

  useEffect(() => {
    isSuggestionDisplayed &&
      suggestions.map((id: string) =>
        getVideoDescription(id).then((res) => {
          setSuggestionList((prev) => [
            ...prev,
            { ...res, videoId: id, progression: 0 },
          ]);
        })
      );
    console.log("suggestions", suggestionList);
  }, [isSuggestionDisplayed]);

  return (
    <div className={styles.main}>
      {/* <h1>Courses</h1> */}
      <div className={styles["input-container"]}>
        <input
          type='search'
          placeholder='Enter your YouTube URL here...'
          ref={inputRef}></input>
        <div>
          <button onClick={handleSubmit}>Add course</button>
          <button
            onClick={() => setIsSuggestionDisplayed(!isSuggestionDisplayed)}>
            {isSuggestionDisplayed ? "Hide Suggestions" : "Show Suggestions"}
          </button>
        </div>
      </div>
      <div className={styles["card-container"]}>
        <h2>{isSuggestionDisplayed ? "Suggestions: " : "Courses:"}</h2>
        <div className={styles["card-list-container"]}>
          {isSuggestionDisplayed ? (
            suggestionList.map((course, idx: number) => (
              <SuggestionCourseCard
                key={idx}
                course={course}
                cardIndex={idx}
                courseList={suggestionList}
                setCourseList={setSuggestionList}
              />
            ))
          ) : courseList.length !== 0 ? (
            courseList.map((course, idx: number) => (
              <CourseCard
                key={idx}
                course={course}
                cardIndex={idx}
                courseList={courseList}
                setCourseList={setCourseList}
              />
            ))
          ) : (
            <></>
          )}
        </div>
      </div>
    </div>
  );
};

export default Courses;

import { HiOutlineTrash } from "react-icons/hi";

type Props = {
  course: Course;
  cardIndex: number;
  courseList: Course[];
  setCourseList: (value: React.SetStateAction<Course[]>) => void;
};
const CourseCard = (props: Props) => {
  const { setVideoId } = useVideo();
  const [value, setValue] = useState(0);

  const getVideoCourse = (videoId: string) => {
    setVideoId(videoId);
  };

  const deleteCard = (cardIdx: number) => {
    props.setCourseList(
      props.courseList.filter((_, idx: number) => idx !== cardIdx)
    );
  };

  useEffect(() => {
    localStorage.setItem("courses", JSON.stringify(props.courseList));
  }, [props.courseList]);

  useEffect(() => {
    if (localStorage.getItem("courses") !== null) {
      const course: Course = JSON.parse(
        localStorage.getItem("courses") as string
      ).filter(
        (elt: { videoId: string }) => elt.videoId === props.course.videoId
      )[0];
      props.course.progression =
        course.progression !== null ? course.progression : 0;
      // console.log("prog", props.course.progression);
      setValue(
        props.course.progression > 0
          ? props.course.progression < 1
            ? Number(props.course.progression.toPrecision(1))
            : Number(props.course.progression.toPrecision(2))
          : 0
      );
    }
  }, []);

  return (
    <Link href='/videos'>
      <div
        className={styles["course-card"]}
        onClick={() => getVideoCourse(props.course.videoId)}>
        <div className={styles["img-container"]}>
          <img
            src={
              props.course.thumbnails?.standard?.url ||
              props.course.thumbnails?.medium.url ||
              props.course.thumbnails?.default.url
            }
            alt=''
          />
        </div>
        <div className={styles["course-description"]}>
          <h3>{props.course.title}</h3>
          <div>
            <p>{props.course.channelTitle}</p>

            <progress
              max={100}
              value={
                props.course.progression > 0 ? props.course.progression : 0
              }></progress>
            <p>
              <span>
                {formatDurationToTimecode(props.course.duration)} - {value}%
                completed
              </span>
              <HiOutlineTrash
                size={30}
                onClick={(e) => {
                  e.preventDefault();
                  deleteCard(props.cardIndex);
                }}
              />
            </p>
          </div>
        </div>
      </div>
    </Link>
  );
};

type SuggestionProps = {
  course: Course;
  cardIndex: number;
  courseList: Course[];
  setCourseList: (value: React.SetStateAction<Course[]>) => void;
};

const SuggestionCourseCard = (props: SuggestionProps) => {
  const { setVideoId } = useVideo();

  const getVideoCourse = (videoId: string) => {
    if (localStorage.getItem("courses") !== null) {
      const courses: Course[] = JSON.parse(
        localStorage.getItem("courses") as string
      );
      courses.filter((course) => course.videoId === props.course.videoId)
        .length === 0 &&
        localStorage.setItem(
          "courses",
          JSON.stringify([...courses, props.course])
        );
    } else {
      localStorage.setItem("courses", JSON.stringify([props.course]));
    }
    setVideoId(videoId);
  };

  return (
    <Link href='/videos'>
      <div
        className={styles["course-card"]}
        onClick={() => getVideoCourse(props.course.videoId)}>
        <div className={styles["img-container"]}>
          <img
            src={
              props.course.thumbnails?.standard?.url ||
              props.course.thumbnails?.medium.url ||
              props.course.thumbnails?.default.url
            }
            alt=''
          />
        </div>
        <div className={styles["course-description"]}>
          <h3>{props.course.title}</h3>
          <div>
            <p>{props.course.channelTitle}</p>

            <p>
              <span>{formatDurationToTimecode(props.course.duration)}</span>
            </p>
          </div>
        </div>
      </div>
    </Link>
  );
};
