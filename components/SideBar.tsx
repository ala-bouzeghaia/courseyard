import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import {
  IoHomeOutline,
  IoCalendarOutline,
  IoCaretForwardCircleOutline,
} from "react-icons/io5";
import { MdOutlineAnalytics } from "react-icons/md";
import {
  HiOutlineClipboardList,
  HiOutlineLogout,
  HiOutlineLogin,
} from "react-icons/hi";
import { FaGraduationCap } from "react-icons/fa";
import styles from "../styles/SideBar.module.scss";
import { useSession } from "next-auth/react";

type Props = {
  children: React.ReactNode;
};

const SideBar = ({ children }: Props) => {
  const { data: session } = useSession();
  const router = useRouter();
  // console.log(router);
  const [openSideBar, setOpenSideBar] = useState(true);

  const handleSideBarSize = () => {
    setOpenSideBar(!openSideBar);
  };

  return (
    <div className={styles.container}>
      <div
        className={`${styles["sidebar-menu"]} ${
          styles[openSideBar ? "open" : "close"]
        }`}>
        <div onClick={handleSideBarSize} className={styles["logo-container"]}>
          <div className={styles["svg-container"]}>
            <FaGraduationCap size={28} />
          </div>
          <span className={`${styles[openSideBar ? "open" : "close"]}`}>
            courseyard
          </span>
        </div>
        <div className={styles["sidebar-items"]}>
          <ul>
            <li>
              <Link href='/'>
                <a
                  className={`${
                    router.pathname === "/" ? styles["active-item"] : ""
                  }`}>
                  <IoHomeOutline />
                  {openSideBar ? <span>Home</span> : ""}
                </a>
              </Link>
            </li>
            <li>
              <Link href='/schedule'>
                <a
                  className={`${
                    router.pathname === "/schedule" ? styles["active-item"] : ""
                  }`}>
                  <IoCalendarOutline />
                  {openSideBar ? <span>Schedule</span> : ""}
                </a>
              </Link>
            </li>
            <li>
              <Link href='/courses'>
                <a
                  className={`${
                    router.pathname === "/courses" ? styles["active-item"] : ""
                  }`}>
                  <HiOutlineClipboardList />
                  {openSideBar ? <span>Courses</span> : ""}
                </a>
              </Link>
            </li>
            <li>
              <Link href='/videos'>
                <a
                  className={`${
                    router.pathname === "/videos" ? styles["active-item"] : ""
                  }`}>
                  <IoCaretForwardCircleOutline />
                  {openSideBar ? <span>Videos</span> : ""}
                </a>
              </Link>
            </li>
            <li>
              <Link href='/analytics'>
                <a
                  className={`${
                    router.pathname === "/analytics"
                      ? styles["active-item"]
                      : ""
                  }`}>
                  <MdOutlineAnalytics />
                  {openSideBar ? <span>Analytics</span> : ""}
                </a>
              </Link>
            </li>
            <li></li>

            {session ? (
              <li>
                <Link href='/signout'>
                  <a
                    className={`${
                      router.pathname === "/signout"
                        ? styles["active-item"]
                        : ""
                    }`}>
                    <HiOutlineLogout />
                    {openSideBar ? <span>Logout</span> : ""}
                  </a>
                </Link>
              </li>
            ) : (
              <li>
                <Link href='/signin'>
                  <a
                    className={`${
                      router.pathname === "/signin" ? styles["active-item"] : ""
                    }`}>
                    <HiOutlineLogin />
                    {openSideBar ? <span>Login</span> : ""}
                  </a>
                </Link>
              </li>
            )}
          </ul>
        </div>
      </div>
      <main className={styles.main}>{children}</main>
    </div>
  );
};

export default SideBar;
