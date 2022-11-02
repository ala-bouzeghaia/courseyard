import type { NextPage } from "next";
import Head from "next/head";
import styles from "../styles/Home.module.scss";
import { useSession } from "next-auth/react";
import Link from "next/link";

const Home: NextPage = () => {
  const { data: session } = useSession();
  // const [loading, setLoading] = useState(false);
  // const [subsList, setSubsList] = useState([]);

  // const getData = async () => {
  //   // console.log("test");

  //   const { data } = await axios.get("/api/youtubePlaylist", {
  //     withCredentials: true,
  //   });
  //   // console.log(data);

  //   return data;
  // };

  // useEffect(() => {
  //   getData().then(
  //     (data) => console.log("data", data)
  //     /* setSubsList(
  //       data.map((sub: { id: any; snippet: { title: any } }) => ({
  //         id: sub.id,
  //         title: sub.snippet.title,
  //       }))
  //     ) */
  //   );
  // }, []);

  // console.log("session", session?.user);

  return (
    <div className={styles.container}>
      <Head>
        <title>Courseyard, your learning companion</title>
        <meta name='description' content='Generated by create next app' />
        <link rel='icon' href='/logo-courseyard.svg' />
      </Head>
      {session && <h1>Hello {session.user?.name} </h1>}

      <div className={styles.description}>
        <h2>Track your personal progress</h2>
        <h3>Learn better and faster with a true learning companion</h3>
        <p>
          Load Youtube video courses from the{" "}
          <Link href='/courses'>Courses Section</Link> or directly from Youtube.
          <br />
          Add your selected Youtube videos in the Courses Section or Log in and
          add your courses in the courseyard Youtube playlist created.
        </p>
        <div className={styles["button-container"]}>
          {session ? (
            <Link href='/signout'>Log Out</Link>
          ) : (
            <Link href='/signin'>Log In</Link>
          )}
          <Link href='/courses'>Start Learning</Link>
        </div>
      </div>
    </div>
  );
};

export default Home;
