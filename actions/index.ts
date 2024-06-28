import { GET_TEMPORARY_DATA, RUN_ACTIONS, SAVE_REPLAY_TEXT, SAVE_TEMPORARY_DATA, SEARCH_REPLAY_DATAS } from "./config";
import { handelGetTemproaryData, handelSaveTemproaryData, handleRunActions, handleSaveReplayText, handleSearchReplay } from "./events";

export const ACTICON_MAP = {
    [SAVE_REPLAY_TEXT]: handleSaveReplayText,
    [SEARCH_REPLAY_DATAS]: handleSearchReplay,
		[RUN_ACTIONS]: handleRunActions,
    [SAVE_TEMPORARY_DATA]: handelSaveTemproaryData,
    [GET_TEMPORARY_DATA]: handelGetTemproaryData,
}