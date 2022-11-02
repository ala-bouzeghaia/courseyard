import { useEffect, useState } from "react";
import YouTube from "react-youtube";
import {
  HiOutlinePencil,
  HiOutlineTrash,
  HiOutlineCheckCircle,
} from "react-icons/hi";
import styles from "../styles/Videos.module.scss";

type Note = {
  timecode: number;
  note: string;
};

type NoteProps = {
  note: Note;
  notesList: Note[];
  setNotesList: (value: React.SetStateAction<Note[]>) => void;
  openNoteTextarea: boolean;
  setOpenNoteTextarea: (value: React.SetStateAction<boolean>) => void;
  textareaRef: React.RefObject<HTMLTextAreaElement>;
  player: YouTube["internalPlayer"];
  noteIndex: number;
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

const Note = (props: NoteProps) => {
  const [isEditingNote, setIsEditingNote] = useState(false);

  useEffect(() => {
    if (!props.openNoteTextarea) {
      setIsEditingNote(false);
    }
  }, [props.openNoteTextarea]);

  const deleteNote = (noteIndex: number) => {
    props.setNotesList(
      props.notesList.filter((_, idx: number) => idx !== noteIndex)
    );
  };

  const editNote = (noteToEdit: Note) => {
    if (!props.openNoteTextarea && !isEditingNote) {
      setIsEditingNote(true);
      props.setOpenNoteTextarea(true);
      if (props.textareaRef.current !== null)
        props.textareaRef.current.value = noteToEdit.note;
    } else {
      setIsEditingNote(false);
    }
  };

  const saveNoteChanges = (noteIndex: number) => {
    const newNote = props.textareaRef.current?.value as string;
    if (newNote !== "") {
      props.setNotesList((prev: Note[]) =>
        prev.map((x, idx: number) =>
          idx === noteIndex ? { ...x, note: newNote } : x
        )
      );
    }
    if (props.textareaRef.current !== null)
      props.textareaRef.current.value = "";
    props.setOpenNoteTextarea(false);
    setIsEditingNote(false);
  };

  return (
    <div className={styles.note}>
      <p
        className={styles.timecode}
        onClick={() => {
          props.player.seekTo(props.note.timecode);
        }}>
        {formatTime(props.note.timecode)}
      </p>
      <p>{props.note.note}</p>
      <div>
        {isEditingNote && props.openNoteTextarea ? (
          <HiOutlineCheckCircle
            size={20}
            onClick={() => saveNoteChanges(props.noteIndex)}
          />
        ) : (
          <HiOutlinePencil size={20} onClick={() => editNote(props.note)} />
        )}
        <HiOutlineTrash size={20} onClick={() => deleteNote(props.noteIndex)} />
      </div>
    </div>
  );
};

export default Note;
