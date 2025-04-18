import React, { useState, useEffect, useRef } from 'react';
import { List, Typography, Spin } from 'antd';
import { Storage } from '@plasmohq/storage';
import { faker } from '@faker-js/faker/locale/zh_CN';

const { Text } = Typography;
const storage = new Storage();

// 默认配置项，与右键菜单一致
const defaultConfigs = [
  {
    id: 'default-name',
    name: '姓名',
    type: 'FakerName',
    generate: () => faker.person.fullName()
  },
  {
    id: 'default-email',
    name: '邮箱',
    type: 'FakerEmail',
    generate: () => faker.internet.email()
  },
  {
    id: 'default-phone',
    name: '手机号',
    type: 'FakerPhone',
    generate: () => faker.phone.number({ style: 'international' })
  }
];

export default function FakerPopupSelector({ visible, position, onSelect, onClose }) {
  const [userConfigs, setUserConfigs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const selectorRef = useRef(null);
  const listRef = useRef(null);

  // 合并默认配置和用户配置
  const allConfigs = [...defaultConfigs, ...userConfigs];

  // 计算弹窗位置，确保不超出视口
  const calculatePosition = () => {
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    
    // 默认位置 - 在鼠标点击位置右下方
    let top = position.top;
    let left = position.left;
    
    // 弹窗尺寸
    const popupWidth = 280;
    const popupHeight = 300;
    const margin = 10; // 边距
    
    // 检查右边界 - 如果弹窗会超出右边界，则显示在左侧
    if (left + popupWidth + margin > viewportWidth) {
      left = Math.max(margin, left - popupWidth);
    }
    
    // 检查底部边界 - 如果弹窗会超出底部，则显示在上方
    if (top + popupHeight + margin > window.scrollY + viewportHeight) {
      top = Math.max(window.scrollY + margin, top - popupHeight);
    }
    
    // 确保不会超出顶部
    if (top < window.scrollY + margin) {
      top = window.scrollY + margin;
    }
    
    // 确保不会超出左边界
    if (left < margin) {
      left = margin;
    }
    
    return { top, left };
  };
  
  const adjustedPosition = calculatePosition();

  useEffect(() => {
    if (visible) {
      loadUserConfigs();
      setSelectedIndex(0);
      // 使用setTimeout确保事件监听器在当前点击事件之后添加
      setTimeout(() => {
        document.addEventListener('click', handleClickOutside);
        document.addEventListener('keydown', handleKeyDown);
      }, 0);
    }
    return () => {
      document.removeEventListener('click', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [visible]);

  // 处理键盘导航
  const handleKeyDown = (event) => {
    if (!visible || allConfigs.length === 0) return;

    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        setSelectedIndex((prevIndex) => 
          prevIndex < allConfigs.length - 1 ? prevIndex + 1 : prevIndex
        );
        break;
      case 'ArrowUp':
        event.preventDefault();
        setSelectedIndex((prevIndex) => 
          prevIndex > 0 ? prevIndex - 1 : prevIndex
        );
        break;
      case 'Enter':
        event.preventDefault();
        if (selectedIndex >= 0 && selectedIndex < allConfigs.length) {
          handleSelect(allConfigs[selectedIndex]);
        }
        break;
      case 'Escape':
        event.preventDefault();
        onClose();
        break;
    }
  };

  // 确保选中项在视图中可见
  useEffect(() => {
    if (listRef.current && visible) {
      const selectedItem = listRef.current.querySelector(`.faker-popup-item-${selectedIndex}`);
      if (selectedItem) {
        selectedItem.scrollIntoView({ block: 'nearest' });
      }
    }
  }, [selectedIndex, visible]);

  const handleClickOutside = (event) => {
    if (selectorRef.current && !selectorRef.current.contains(event.target)) {
      onClose();
    }
  };

  const loadUserConfigs = async () => {
    try {
      setLoading(true);
      const configs = await storage.get('fakerUserConfigs');
      if (configs) {
        setUserConfigs(JSON.parse(configs));
      }
      setLoading(false);
    } catch (error) {
      console.error('加载用户配置失败:', error);
      setLoading(false);
    }
  };

  const handleSelect = (config) => {
    // 处理默认配置项
    if (config.id.startsWith('default-')) {
      // 对于默认配置，直接生成值并返回
      const value = config.generate();
      onSelect({ 
        id: config.id,
        name: config.name,
        value: value,
        type: config.type,
        isDefault: true
      });
    } else {
      // 用户自定义配置
      onSelect(config);
    }
    onClose();
  };

  if (!visible) return null;

  return (
    <div
      ref={selectorRef}
      style={{
        position: 'absolute', // 改为 absolute 而不是 fixed，以便更好地处理滚动
        top: adjustedPosition.top + 'px',
        left: adjustedPosition.left + 'px',
        width: '280px',
        maxHeight: '300px',
        backgroundColor: 'white',
        border: '1px solid #eaeaea',
        borderRadius: '6px',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)',
        zIndex: 2147483647,
        overflow: 'hidden',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif'
      }}
    >
      <div style={{ padding: '8px 12px', borderBottom: '1px solid #f0f0f0', backgroundColor: '#fafafa' }}>
        <Text strong style={{ fontSize: '13px' }}>选择 Faker 配置</Text>
      </div>
      
      {loading ? (
        <div style={{ padding: '20px', textAlign: 'center' }}>
          <Spin size="small" />
        </div>
      ) : allConfigs.length === 0 ? (
        <div style={{ padding: '16px', textAlign: 'center' }}>
          <Text type="secondary" style={{ fontSize: '13px' }}>暂无可用配置</Text>
        </div>
      ) : (
        <div 
          ref={listRef}
          style={{ maxHeight: '250px', overflow: 'auto', padding: '4px 0' }}
        >
          {/* 默认配置区域 */}
          {defaultConfigs.length > 0 && (
            <div style={{ padding: '4px 12px', backgroundColor: '#f9f9f9' }}>
              <Text type="secondary" style={{ fontSize: '12px' }}>默认配置</Text>
            </div>
          )}
          
          {defaultConfigs.map((config, index) => (
            <div
              key={config.id}
              className={`faker-popup-item faker-popup-item-${index}`}
              onClick={(e) => {
                e.stopPropagation();
                handleSelect(config);
              }}
              style={{
                padding: '8px 12px',
                cursor: 'pointer',
                backgroundColor: selectedIndex === index ? '#f0f7ff' : 'transparent',
                borderLeft: selectedIndex === index ? '3px solid #1890ff' : '3px solid transparent',
                transition: 'background-color 0.2s',
                display: 'flex',
                alignItems: 'center'
              }}
              onMouseEnter={() => setSelectedIndex(index)}
            >
              <Text 
                style={{ 
                  fontSize: '13px',
                  color: selectedIndex === index ? '#1890ff' : 'rgba(0, 0, 0, 0.85)',
                  fontWeight: selectedIndex === index ? 500 : 'normal'
                }}
              >
                {config.name}
              </Text>
            </div>
          ))}
          
          {/* 用户配置区域 */}
          {userConfigs.length > 0 && (
            <div style={{ padding: '4px 12px', backgroundColor: '#f9f9f9' }}>
              <Text type="secondary" style={{ fontSize: '12px' }}>自定义配置</Text>
            </div>
          )}
          
          {userConfigs.map((config, index) => (
            <div
              key={config.id}
              className={`faker-popup-item faker-popup-item-${index + defaultConfigs.length}`}
              onClick={(e) => {
                e.stopPropagation();
                handleSelect(config);
              }}
              style={{
                padding: '8px 12px',
                cursor: 'pointer',
                backgroundColor: selectedIndex === index + defaultConfigs.length ? '#f0f7ff' : 'transparent',
                borderLeft: selectedIndex === index + defaultConfigs.length ? '3px solid #1890ff' : '3px solid transparent',
                transition: 'background-color 0.2s',
                display: 'flex',
                alignItems: 'center'
              }}
              onMouseEnter={() => setSelectedIndex(index + defaultConfigs.length)}
            >
              <Text 
                style={{ 
                  fontSize: '13px',
                  color: selectedIndex === index + defaultConfigs.length ? '#1890ff' : 'rgba(0, 0, 0, 0.85)',
                  fontWeight: selectedIndex === index + defaultConfigs.length ? 500 : 'normal'
                }}
              >
                {config.name}
              </Text>
            </div>
          ))}
        </div>
      )}
      
      <div style={{ 
        padding: '6px 12px', 
        borderTop: '1px solid #f0f0f0', 
        backgroundColor: '#fafafa',
        fontSize: '12px',
        color: '#999',
        display: 'flex',
        justifyContent: 'space-between'
      }}>
        <span>↑↓ 导航</span>
        <span>↵ 选择</span>
      </div>
    </div>
  );
}