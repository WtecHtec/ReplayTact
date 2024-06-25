
import cssText from 'data-text:~content.css';
import cssCmdkText from 'data-text:~cmdk.css';
import antdResetCssText from "data-text:antd/dist/reset.css"

import React from "react";
import type { PlasmoCSConfig, PlasmoGetShadowHostId } from 'plasmo';
import RelpayText from '~components/replaytext';
import CmdkLauncher from '~components/cmdklauncher';
import ActionEditor from '~components/actioneditor';

export const config: PlasmoCSConfig = {
    matches: ["<all_urls>"],
    all_frames: true
}
export const getStyle = () => {
    const style = document.createElement('style');
    style.textContent = antdResetCssText + cssText + cssCmdkText;
    return style;
};

const HOST_ID = "replay-engage-csui"

export const getShadowHostId: PlasmoGetShadowHostId = () => HOST_ID


export default function InitContent() {

    return (
        <>
            <ActionEditor></ActionEditor>
            <CmdkLauncher></CmdkLauncher>
            <RelpayText></RelpayText>
        </>
    )
}