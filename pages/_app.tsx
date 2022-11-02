import "../styles/globals.scss";
import "../styles/calendar.scss";
import type { AppProps } from "next/app";
import SideBar from "../components/SideBar";
import { VideoProvider } from "../context/VideoContext";
// import "@fullcalendar/common/main.css"; // @fullcalendar/react imports @fullcalendar/common
// import "@fullcalendar/timeline/main.css"; // @fullcalendar/resource-timeline imports @fullcalendar/timeline
// import "@fullcalendar/resource-timeline/main.css"; // @fullcalendar/resource-timeline is a direct import
import "@fullcalendar/common/main.css";
import "@fullcalendar/daygrid/main.css";
// import "@fullcalendar/timegrid/main.css";
import { SessionProvider } from "next-auth/react";
import { Session } from "next-auth";

function MyApp({ Component, pageProps }: AppProps<{ session: Session }>) {
  return (
    <SessionProvider session={pageProps.session}>
      <SideBar>
        <VideoProvider>
          <Component {...pageProps} />
        </VideoProvider>
      </SideBar>
    </SessionProvider>
  );
}

export default MyApp;
