import { SpeakerKey } from "./speaker";
import { TalkId } from "../../conference-hall/model/talk";
import { Markdown } from "./index";
import { CategoryKey } from "./category";
import { FormatKey } from "./format";

export type SessionKey = string;

// TLS: beginner, advanced, expert
export type SessionLevel = string;

export interface Session {
  id?: TalkId;
  key: SessionKey;
  title: string;
  level?: SessionLevel;
  format: FormatKey;
  speakers: SpeakerKey[];
  tags: CategoryKey[];
  language?: string;
  videoId?: string | null;
  presentation?: string | null;
  draft?: boolean;

  description: Markdown;
}

export type Sessions = Session[];
