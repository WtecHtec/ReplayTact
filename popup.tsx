import React, { useState, useEffect } from "react"
import { Button, Switch, Typography, Divider, Space, Input, List, Tag, Tooltip } from 'antd';
import { PlusOutlined, DeleteOutlined } from '@ant-design/icons';
import { Storage } from '@plasmohq/storage';

const { Text, Title } = Typography;
const storage = new Storage();

function IndexPopup() {
  const [slashTriggerEnabled, setSlashTriggerEnabled] = useState(true);
  const [domainList, setDomainList] = useState([]);
  const [newDomain, setNewDomain] = useState('');

  useEffect(() => {
    // 加载设置
    const loadSettings = async () => {
      try {
        const enabled = await storage.get('slashTriggerEnabled');
        if (enabled !== undefined) {
          setSlashTriggerEnabled(enabled === 'true');
        }
        
        const domains = await storage.get('slashTriggerDomains');
        if (domains) {
          setDomainList(JSON.parse(domains));
        }
      } catch (error) {
        console.error('加载设置失败:', error);
      }
    };
    
    loadSettings();
  }, []);

  const handleSlashTriggerChange = async (checked) => {
    setSlashTriggerEnabled(checked);
    await storage.set('slashTriggerEnabled', checked.toString());
    
    // 通知所有标签页更新设置
    notifyTabsSettingsChanged();
  };
  
  const addDomain = async () => {
    if (!newDomain) return;
    
    // 简单验证域名格式
    const domainPattern = /^([a-zA-Z0-9]([a-zA-Z0-9\-]{0,61}[a-zA-Z0-9])?\.)+[a-zA-Z]{2,}$/;
    if (!domainPattern.test(newDomain)) {
      alert('请输入有效的域名，例如: example.com');
      return;
    }
    
    const updatedList = [...domainList, newDomain];
    setDomainList(updatedList);
    setNewDomain('');
    
    await storage.set('slashTriggerDomains', JSON.stringify(updatedList));
    notifyTabsSettingsChanged();
  };
  
  const removeDomain = async (domain) => {
    const updatedList = domainList.filter(d => d !== domain);
    setDomainList(updatedList);
    
    await storage.set('slashTriggerDomains', JSON.stringify(updatedList));
    notifyTabsSettingsChanged();
  };
  
  const notifyTabsSettingsChanged = () => {
    chrome.tabs.query({}, (tabs) => {
      tabs.forEach(tab => {
        chrome.tabs.sendMessage(tab.id, { 
          action: 'updateSlashTriggerSettings', 
          enabled: slashTriggerEnabled,
          domains: domainList
        }).catch(() => {
          // 忽略错误，因为有些标签页可能没有内容脚本
        });
      });
    });
  };

  return (
    <div style={{ width: '300px', padding: '16px' }}>
      <Title level={4}>ReplayTact 设置</Title>
      
      <Divider />
{/*       
      <div style={{ marginBottom: '16px' }}>
        <Space>
          <Switch 
            checked={slashTriggerEnabled} 
            onChange={handleSlashTriggerChange} 
          />
          <Text>启用斜杠(/)触发 Faker 生成器</Text>
        </Space>
        <div style={{ marginTop: '8px' }}>
          <Text type="secondary">
            在输入框中输入 / 时弹出 Faker 生成器选项
          </Text>
        </div>
      </div>
      
      <Divider /> */}
      
      <div style={{ marginBottom: '16px' }}>
        <Title level={5}>启用域名列表</Title>
        <Text type="secondary">
          只在以下域名中启用斜杠触发功能（留空则在所有网站启用）
        </Text>
        
        <div style={{ marginTop: '12px', display: 'flex' }}>
          <Input 
            placeholder="输入域名，如: example.com" 
            value={newDomain}
            onChange={(e) => setNewDomain(e.target.value)}
            onPressEnter={addDomain}
            style={{ flex: 1 }}
          />
          <Button 
            type="primary" 
            icon={<PlusOutlined />} 
            onClick={addDomain}
            style={{ marginLeft: '8px' }}
          />
        </div>
        
        <List
          style={{ marginTop: '8px', maxHeight: '150px', overflow: 'auto' }}
          size="small"
          dataSource={domainList}
          renderItem={domain => (
            <List.Item
              actions={[
                <Tooltip title="删除">
                  <Button 
                    type="text" 
                    danger 
                    icon={<DeleteOutlined />} 
                    onClick={() => removeDomain(domain)}
                    size="small"
                  />
                </Tooltip>
              ]}
            >
              <Tag color="blue">{domain}</Tag>
            </List.Item>
          )}
        />
      </div>
      
      <Divider />

    </div>
  )
}

export default IndexPopup