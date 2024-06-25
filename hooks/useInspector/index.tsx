/* eslint-disable */
// @ts-nocheck
import { useState, useEffect, useRef } from 'react'



import { getMaxZIndex, createElement, addOverlay, getTouchMouseTargetElement } from './dom';
import { getXpath } from './xpath';
import { throttle } from './utils';

const MOUSE_MOVE = 'mousemove'
const MOUSE_DOWN = 'mousedown'
/** 最大 zindex  */
const maxZIndex = getMaxZIndex() + 1
// 操作maker(html 元素)
const optOverlay = createElement('div', {
  id: 'dom-inspector-root-jest-pro-overlay',
  style: `z-index: ${maxZIndex};`,
});
// 创建辅助元素，用于判断圈选器元素是否被缩放
const assistEle = createElement('div', {
  id: 'dom-inspector-root-jest-pro-scale',
  style: `pointer-events: none;
  visibility: hidden;
  width: 100px;
  height: 100px;
  position: absolute;
  top: -100px;`
});

/** 移除圈选蒙层 */
function _remove() {
  optOverlay.innerHTML = '';
}
    
function useInspector() {
  const [xPath, setXPath] = useState('')
  const [refresh, setRefresh] = useState(-1)
  const optRef = useRef({
    status: false,
  })
  useEffect(() => {
    // 在 html 中加入而非 body，从而消除对 dom 的影响 及 mutationObserver 的频繁触发
    document.body && document.body.appendChild(optOverlay);
    document.body && document.body.appendChild(assistEle);
    // 当前操作 元素
    let currentTarget = null
    // 缓存 操作元素
    let _cachedTarget = null
    // 当前元素 xpath
    // let currentXpath = ''
    function _onMove(e) {
    //   console.log('_onMove', e, optRef.current.status)
      if (!optRef.current.status) return
      const target = getTouchMouseTargetElement(e)
      if (target && optOverlay && optOverlay.contains(target)) return;
      currentTarget = target;
      if (currentTarget === _cachedTarget) return null;
      _remove()
      _cachedTarget = currentTarget
      addOverlay({
        target: target,
        root: optOverlay,
        assistEle: assistEle,
      });
      // currentXpath = getXpath(target, true)
      // setXPath(currentXpath)
    }
    const _throttleOnMove = throttle(_onMove, 300)
    document.body.addEventListener(MOUSE_MOVE, _throttleOnMove, {
      capture: true,
      passive: true,
    });

    function _onKeyUp(e) {
        if (optRef.current.status) {
            e.preventDefault()
            e.stopPropagation()
            const currentXpath = getXpath(currentTarget, true)
            setXPath(currentXpath)
            _remove()
            setRefresh(Math.random())
            updateStatus(false)
            // console.log('_onKeyUp----')
            // setStatus(false)
        }
    }
    const _throttleOnKeyUp = throttle(_onKeyUp, 300)
    document.body.addEventListener(MOUSE_DOWN, _throttleOnKeyUp)

    return () => {
      document.body.removeEventListener(MOUSE_MOVE, _throttleOnMove)
      document.body.removeEventListener(MOUSE_DOWN, _throttleOnKeyUp)
    }
  }, [])
  const updateStatus = (status) => {
    if (status) {
        window.document.body.style.cursor = 'pointer'
    } else {
        window.document.body.style.cursor = ''
    }
    optRef.current.status = status
  }
  return [xPath, updateStatus, refresh]
}

export default useInspector