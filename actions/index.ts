import { RUN_ACTIONS, SAVE_REPLAY_TEXT, SEARCH_REPLAY_DATAS } from "./config";
import { handleRunActions, handleSaveReplayText, handleSearchReplay } from "./events";

export const ACTICON_MAP = {
    [SAVE_REPLAY_TEXT]: handleSaveReplayText,
    [SEARCH_REPLAY_DATAS]: handleSearchReplay,
		[RUN_ACTIONS]: handleRunActions
}