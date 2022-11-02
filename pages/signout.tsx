import React, { useEffect } from "react";
import { useRouter } from "next/router";
import { signOut, useSession } from "next-auth/react";
import { FaGraduationCap } from "react-icons/fa";
import styles from "../styles/Auth.module.scss";

const SignOut = () => {
  const router = useRouter();
  const { data: session } = useSession();

  useEffect(() => {
    if (!session) router.push("/");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session]);

  return (
    <div className={styles.container}>
      <div className={styles.signout}>
        {/* <h3>
          <FaGraduationCap />
          courseyard
        </h3> */}
        <div className={styles["logo-container"]}>
          <div className={styles["svg-container"]}>
            <FaGraduationCap size={30} />
          </div>
          <span>courseyard</span>
        </div>
        <p>Are you sure you want to sign out?</p>
        <button onClick={() => signOut()}>
          <span>Sign out</span>
        </button>
      </div>
    </div>
  );
};

export default SignOut;
