import { SAVE_REPLAY_TEXT, SEARCH_REPLAY_DATAS } from "./config";
import { handleSaveReplayText, handleSearchReplay } from "./events";

export const ACTICON_MAP = {
    [SAVE_REPLAY_TEXT]: handleSaveReplayText,
    [SEARCH_REPLAY_DATAS]: handleSearchReplay
}