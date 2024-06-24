
import cssText from 'data-text:~content.css';
import antdResetCssText from "data-text:antd/dist/reset.css"
import { StyleProvider } from "@ant-design/cssinjs"

import React, { useEffect, useState } from "react";
import type { PlasmoCSConfig, PlasmoGetShadowHostId } from 'plasmo';
import RelpayText from '~components/replaytext';
import { getDomain } from '~uitls';
import { searchReplayText } from '~api';

export const config: PlasmoCSConfig = {
    matches: ["<all_urls>"],
    all_frames: true
}
export const getStyle = () => {
    const style = document.createElement('style');
    style.textContent = antdResetCssText + cssText;
    return style;
};

const HOST_ID = "replay-engage-csui"

export const getShadowHostId: PlasmoGetShadowHostId = () => HOST_ID


export default function InitContent() {

    const getReplayDatas = async () => {
       const datas = await  searchReplayText(getDomain())
       console.log('getReplayDatas---', datas)
    }

    useEffect(() => {
        getReplayDatas()
    })
    return (
        <>
            {/* <StyleProvider container={document.getElementById(HOST_ID).shadowRoot}>
                <Button type="primary" onClick={showModal}>
                    Open Modal
                </Button>
            </StyleProvider> */}
           <RelpayText></RelpayText>
        </>
    )
}