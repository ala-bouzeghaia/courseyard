import { useEffect, useRef, useState } from "react";
import FullCalendar, {
  DateSelectArg,
  EventAddArg,
  EventApi,
  EventChangeArg,
  EventClickArg,
  EventInput,
  EventRemoveArg,
} from "@fullcalendar/react"; // must go before plugins
import dayGridPlugin from "@fullcalendar/daygrid"; // a plugin!
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin, { DateClickArg } from "@fullcalendar/interaction"; // needed for dayClick
import { v4 as uuidv4 } from "uuid";

import styles from "../styles/Schedule.module.scss";

type EventType = { title: string; description: string };
type CalendarEventType = {
  id: string;
  title: string;
  start: string;
  end: string;
  allDay: boolean;
  description: string;
};
type TimeInfosType = {
  start: string;
  end: string;
  allDay: boolean;
};

const Schedule = () => {
  const calendarRef = useRef<FullCalendar>(null);
  const [isFormDisplayed, setIsFormDisplayed] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [newEvent, setNewEvent] = useState<CalendarEventType>(
    {} as CalendarEventType
  );
  const [eventsList, setEventsList] = useState<EventApi[]>([] as EventApi[]);
  const [timeInfos, setTimeInfos] = useState({} as TimeInfosType);
  const [modifiedEvent, setModifiedEvent] = useState<CalendarEventType>(
    {} as CalendarEventType
  );
  const [isEventClicked, setIsEventClicked] = useState<boolean>(false);
  const [eventClassNames, setEventClassNames] = useState<string[]>([]);

  useEffect(() => {
    if (localStorage.getItem("events") !== null) {
      console.log(
        "localStorage",
        JSON.parse(localStorage.getItem("events") as string)
      );
      // setEventsList(JSON.parse(localStorage.getItem("events") as string) as EventApi[]);
      // setStoredEvents(JSON.parse(localStorage.getItem("events") as string));
      if (calendarRef.current) {
        const calendar = calendarRef.current.getApi();
        JSON.parse(localStorage.getItem("events") as string).map(
          (ev: EventInput) => ev && calendar.addEvent(ev)
        );
      }
    }
  }, []);

  useEffect(() => {
    // console.log(eventsList);
    // console.log(
    //   "tresh",
    //   eventsList.length !== 0 &&
    //     eventsList.every((event) => event.startStr && event.endStr)
    // );
    eventsList.length !== 0 &&
      eventsList.every((event) => event.startStr && event.endStr) &&
      localStorage.setItem(
        "events",
        JSON.stringify(
          eventsList.map((event) => ({
            id: event.id,
            title: event.title,
            allDay: event.allDay,
            start: event.startStr,
            end: event.endStr,
            extendedProps: {
              description: event.extendedProps.description,
            },
            classNames: event.classNames,
            textColor: event.textColor,
          }))
        )
      );
  }, [eventsList]);

  useEffect(() => {
    window.addEventListener("mousedown", mouseClick);
    // window.addEventListener("touchstart", handleTouchStart, { passive: false });
    return () => {
      window.removeEventListener("mousedown", mouseClick);
      // window.removeEventListener("touchstart", handleTouchStart);
    };
  });

  const mouseClick = (e: MouseEvent) => {
    e.preventDefault();
    if (!isFormDisplayed) {
      setMousePosition({ x: e.clientX, y: e.clientY });
    }
  };
  //Add touch case
  // const handleTouchStart = (e: TouchEvent) => {
  //   e.preventDefault();
  //   console.log("touchsdk", e.touches[0].clientX);
  //   if (!isFormDisplayed) {
  //     setMousePosition({
  //       x: e.touches[0].clientX,
  //       y: e.touches[0].clientY,
  //     });
  //   }
  // };
  // console.log("touch", mousePosition);

  const handleEventClick = (clickInfo: EventClickArg) => {
    setIsFormDisplayed(!isFormDisplayed);
    console.log(clickInfo.event);
    setIsEventClicked(true);
    setModifiedEvent({
      id: clickInfo.event.id,
      title: clickInfo.event.title,
      start: clickInfo.event.startStr,
      end: clickInfo.event.endStr,
      allDay: clickInfo.event.allDay,
      description: clickInfo.event.extendedProps.description,
    });
    console.log(modifiedEvent);
    // console.log(JSON.stringify([modifiedEvent, clickInfo.event]));
  };

  // console.log("eventList", eventsList);

  const handleSelect = (selectInfo: DateSelectArg) => {
    setIsFormDisplayed(!isFormDisplayed);
    if (!isFormDisplayed) {
      const calendarApi = selectInfo.view.calendar;
      calendarApi.unselect();
      // const newEvent: EventType = {} as EventType;
      setTimeInfos({
        start: selectInfo.startStr,
        end: selectInfo.endStr,
        allDay: selectInfo.allDay,
      });
      // console.log("timeInfos", timeInfos);

      if (newEvent.title) {
        // calendarApi.addEvent({
        //   title: newEvent.title,
        //   start: selectInfo.startStr,
        //   end: selectInfo.endStr,
        //   allDay: selectInfo.allDay,
        //   description: newEvent?.description,
        // });
        // setEventsList((prev) => [
        //   ...prev,
        //   {
        //     id: newEvent.id,
        //     title: newEvent.title,
        //     start: newEvent.start,
        //     end: newEvent.end,
        //     allDay: newEvent.allDay,
        //     description: newEvent?.description,
        //   },
        // ]);
      }
    }
    setNewEvent({} as CalendarEventType);
  };

  const handleEventRemove = (removeInfo: EventRemoveArg) => {
    // if (isEventClicked) {
    //   if (calendarRef.current) {
    //     const calendar = calendarRef.current.getApi();
    //     const currentEvent = calendar.getEventById(modifiedEvent.id);
    //     currentEvent?.remove();
    //   }
    // }
    // setIsEventClicked(false);
    setEventsList((prev) => prev.filter((ev) => ev.id !== removeInfo.event.id));
  };

  const handleEventChange = (changeInfo: EventChangeArg) => {
    setEventsList((prev) =>
      prev.map((ev) => (ev.id === changeInfo.event.id ? changeInfo.event : ev))
    );
  };

  const handleEventAdd = (addInfo: EventAddArg) => {
    // console.log("event add", addInfo.event);
    setEventsList((prev) => [...prev, addInfo.event]);
  };

  return (
    <div className={styles.main}>
      <EventForm
        isFormDisplayed={isFormDisplayed}
        setIsFormDisplayed={setIsFormDisplayed}
        mousePosition={mousePosition}
        newEvent={newEvent}
        setNewEvent={setNewEvent}
        // setEventsList={setEventsList}
        timeInfos={timeInfos}
        calendarRef={calendarRef}
        isEventClicked={isEventClicked}
        modifiedEvent={modifiedEvent}
        setModifiedEvent={setModifiedEvent}
        setIsEventClicked={setIsEventClicked}
        // handleEventRemove={handleEventRemove}
        setEventClassNames={setEventClassNames}
      />
      <FullCalendar
        ref={calendarRef}
        height={"100%"}
        plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
        headerToolbar={{
          left: "prev,next today",
          center: "title",
          right: "dayGridMonth,timeGridWeek,timeGridDay",
        }}
        initialView='dayGridMonth'
        editable={true}
        selectable={true}
        select={handleSelect}
        eventClick={handleEventClick}
        eventChange={handleEventChange}
        eventAdd={handleEventAdd}
        eventRemove={handleEventRemove}
        eventClassNames={eventClassNames}
      />
    </div>
  );
};

export default Schedule;

type EventFormProps = {
  isFormDisplayed: boolean;
  setIsFormDisplayed: (value: boolean) => void;
  mousePosition: { x: number; y: number };
  newEvent: CalendarEventType;
  setNewEvent: (value: React.SetStateAction<CalendarEventType>) => void;
  // setEventsList: (value: React.SetStateAction<CalendarEventType[]>) => void;
  timeInfos: TimeInfosType;
  calendarRef: React.RefObject<FullCalendar>;
  isEventClicked: boolean;
  setIsEventClicked: (value: React.SetStateAction<boolean>) => void;
  modifiedEvent: CalendarEventType;
  setModifiedEvent: (value: React.SetStateAction<CalendarEventType>) => void;
  // handleEventRemove: () => void;
  setEventClassNames: (value: React.SetStateAction<string[]>) => void;
};

const EventForm = (props: EventFormProps) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const formRef = useRef<HTMLDivElement>(null);
  const [top, setTop] = useState(0);
  const [left, setLeft] = useState(0);
  const colorRef1 = useRef<HTMLDivElement>(null);
  const colorRef2 = useRef<HTMLDivElement>(null);
  const colorRef3 = useRef<HTMLDivElement>(null);
  const [eventClassNames, setEventClassNames] = useState<string>("");

  useEffect(() => {
    if (inputRef.current !== null)
      inputRef.current.value = props.isEventClicked
        ? props.modifiedEvent.title
        : "";
    if (textareaRef.current !== null)
      textareaRef.current.value = props.isEventClicked
        ? props.modifiedEvent.description
        : "";
  }, [props.modifiedEvent]);

  const closeForm = () => {
    props.setIsFormDisplayed(false);
    if (inputRef.current !== null) inputRef.current.value = "";
    if (textareaRef.current !== null) textareaRef.current.value = "";
    props.setIsEventClicked(false);
    props.setNewEvent({} as CalendarEventType);
  };

  const handleSubmit = (e: React.SyntheticEvent) => {
    e.preventDefault();
    if (textareaRef.current !== null && inputRef.current !== null) {
      const title = inputRef.current.value;
      const description = textareaRef.current.value;
      const id = uuidv4();

      if (props.isEventClicked) {
        props.setModifiedEvent((prev) => ({ ...prev, title, description }));
        if (props.calendarRef.current) {
          const calendar = props.calendarRef.current.getApi();
          const currentEvent = calendar.getEventById(props.modifiedEvent.id);
          currentEvent?.setProp("title", title ? title : currentEvent.title);
          currentEvent?.setExtendedProp(
            "description",
            description ? description : currentEvent.extendedProps.description
          );

          currentEvent?.setProp("classNames", [eventClassNames]);
          currentEvent?.setProp("textColor", "#14121e");
        }
      } else {
        props.setNewEvent({
          id,
          title,
          description,
          start: props.timeInfos.start,
          end: props.timeInfos.end,
          allDay: props.timeInfos.allDay,
        });
        if (props.calendarRef.current) {
          const calendar = props.calendarRef.current.getApi();
          if (title.length !== 0) {
            calendar.addEvent({
              id,
              title,
              description,
              start: props.timeInfos.start,
              end: props.timeInfos.end,
              allDay: props.timeInfos.allDay,
              classNames: eventClassNames,
              textColor: eventClassNames.length !== 0 ? "#14121e" : "",
            });
          }
        }
      }

      textareaRef.current.value = "";
      inputRef.current.value = "";
    }
    props.setIsFormDisplayed(false);
    props.setIsEventClicked(false);
    setEventClassNames("");
  };
  // console.log(props.newEvent.id);
  // console.log(props.isEventClicked);

  const handleDelete = (e: React.SyntheticEvent) => {
    e.preventDefault();
    if (props.isEventClicked) {
      if (props.calendarRef.current) {
        const calendar = props.calendarRef.current.getApi();
        const currentEvent = calendar.getEventById(props.modifiedEvent.id);
        currentEvent?.remove();
        if (textareaRef.current && inputRef.current) {
          textareaRef.current.value = "";
          inputRef.current.value = "";
        }
      }
    }
    props.setIsFormDisplayed(false);
    props.setIsEventClicked(false);
  };

  const handleEventColor = (colorRef: React.RefObject<HTMLDivElement>) => {
    if (colorRef.current)
      setEventClassNames(colorRef.current.className.split(" ")[1]);
    console.log(colorRef.current?.style.color);
    // if (props.calendarRef.current) {
    //   const calendar = props.calendarRef.current.getApi();
    //   const currentEvent = calendar.getEventById(props.modifiedEvent.id);
    //   if (currentEvent && colorRef.current) {
    //     // let eventClassNames: string = currentEvent.backgroundColor;
    //     currentEvent.setProp("classNames", [
    //       colorRef.current.className.split(" ")[1],
    //     ]);
    //     console.log(colorRef.current.className.split(" ")[1]);
    //     // props.setEventClassNames([colorRef.current.className.split(" ")[1]]);
    //   }
    // }
  };

  // const [divHeight, setDivHeight] = useState(0);
  // const [divWidth, setDivWidth] = useState(0);
  // const [windowHeight, setWindowHeight] = useState(0);
  // const [windowWidth, setWindowWidth] = useState(0);

  // useEffect(() => {
  //   if (formRef.current) {
  //     setDivHeight(formRef.current.clientHeight);
  //     setDivWidth(formRef.current.clientWidth);
  //   }
  //   setWindowHeight(window.innerHeight);
  //   setWindowWidth(window.innerWidth);
  // }, [formRef.current]);

  useEffect(() => {
    setTop(
      props.mousePosition.y < window.innerHeight / 2
        ? props.mousePosition.y
        : props.mousePosition.y - 216
    );
    setLeft(
      props.mousePosition.x < window.innerWidth / 2
        ? props.mousePosition.x
        : props.mousePosition.x - 324
    );
    // console.log("divHeight", formRef.current, "windowHeight", windowHeight);
  }, [props.mousePosition]);

  // console.log("top", top);
  // console.log(
  //   "height",
  //   windowHeight / 2,
  //   "mouse",
  //   props.mousePosition.y,
  //   "top",
  //   props.mousePosition.y < windowHeight / 2
  //     ? props.mousePosition.y
  //     : props.mousePosition.y - divHeight,
  //   "divHeight",
  //   divHeight,
  //   "formref",
  //   formRef.current
  // );

  return (
    <div
      ref={formRef}
      className={
        props.isFormDisplayed ? styles["form-visible"] : styles["form-hidden"]
      }
      style={{
        top: top,
        /* props.mousePosition.y < windowHeight / 2
            ? props.mousePosition.y
            : props.mousePosition.y - divHeight */
        left: left,
        /* props.mousePosition.x < windowWidth / 2
            ? props.mousePosition.x
            : props.mousePosition.x - divWidth */
      }}>
      <div className={styles["close-button"]}>
        <button onClick={closeForm}>X</button>
      </div>
      <form>
        <label htmlFor='title'>Title</label>
        <input type='text' name='title' ref={inputRef} />
        <label htmlFor='description'>Description</label>
        <textarea ref={textareaRef} name='description' />
        <div className={styles["color-picker"]}>
          <div
            className={`${styles.color} ${styles["color-1"]}`}
            ref={colorRef1}
            onClick={() => handleEventColor(colorRef1)}></div>
          <div
            className={`${styles.color} ${styles["color-2"]}`}
            ref={colorRef2}
            style={{ color: "black" }}
            onClick={() => handleEventColor(colorRef2)}></div>
          <div
            className={`${styles.color} ${styles["color-3"]}`}
            ref={colorRef3}
            onClick={() => handleEventColor(colorRef3)}></div>
        </div>
        <div className={styles["buttons-container"]}>
          <button onClick={handleSubmit}>Save</button>
          <button onClick={handleDelete}>Delete</button>
        </div>
      </form>
    </div>
  );
};
