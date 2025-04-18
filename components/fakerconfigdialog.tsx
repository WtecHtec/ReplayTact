import React, { useState, useEffect } from 'react';
import { Modal, Form, Input, Select, Button, Space, Divider, Typography, message } from 'antd';
import { fakerStrategies } from '~faker/config';
import { Storage } from '@plasmohq/storage';

const { Option } = Select;
const { Title, Text } = Typography;
const storage = new Storage();

export default function FakerConfigDialog({ visible, onClose }) {
  const [form] = Form.useForm();
  const [userConfigs, setUserConfigs] = useState([]);
  const [_, contextHolder] = message.useMessage();

  useEffect(() => {
    loadUserConfigs();
  }, [visible]);

  const loadUserConfigs = async () => {
    try {
      const configs = await storage.get('fakerUserConfigs');
      if (configs) {
        setUserConfigs(JSON.parse(configs));
      }
    } catch (error) {
      console.error('加载用户配置失败:', error);
    }
  };

  const saveUserConfig = async (values) => {
    try {
      const newConfig = {
        id: Date.now().toString(),
        name: values.configName,
        fakerType: values.fakerType,
        fakerLocale: values.fakerLocale || 'zh_CN',
        args: values.args || '',
      };

      const newConfigs = [...userConfigs, newConfig];
      await storage.set('fakerUserConfigs', JSON.stringify(newConfigs));
      setUserConfigs(newConfigs);
      form.resetFields();
      message.success('配置保存成功');
    } catch (error) {
      console.error('保存配置失败:', error);
      message.error('保存配置失败');
    }
  };

  const deleteConfig = async (id) => {
    try {
      const newConfigs = userConfigs.filter(config => config.id !== id);
      await storage.set('fakerUserConfigs', JSON.stringify(newConfigs));
      setUserConfigs(newConfigs);
      message.success('配置删除成功');
    } catch (error) {
      console.error('删除配置失败:', error);
      message.error('删除配置失败');
    }
  };

  const reloadExtension = () => {
    try {
      // 发送消息给后台脚本来重新加载扩展
      chrome.runtime.sendMessage({ action: 'reloadExtension' }, (response) => {
        if (chrome.runtime.lastError) {
          console.error('发送重新加载请求失败:', chrome.runtime.lastError);
          message.error('重新加载插件失败');
        } else {
          message.success('插件正在重新加载...');
          setTimeout(() => {
            onClose(); // 关闭配置窗口
            window.location.reload(); // 刷新页面
          }, 500);
        }
      });
    } catch (error) {
      console.error('重新加载插件失败:', error);
      message.error('重新加载插件失败');
    }
  };

  return (
    <>
      {contextHolder}
      <Modal
        title="Faker 生成器配置"
        open={visible}
        onCancel={onClose}
        footer={null}
        width={600}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={saveUserConfig}
        >
          <Form.Item
            name="configName"
            label="配置名称"
            rules={[{ required: true, message: '请输入配置名称' }]}
          >
            <Input placeholder="例如: 中文姓名" />
          </Form.Item>

          <Form.Item
            name="fakerLocale"
            label="语言"
            initialValue="zh_CN"
          >
            <Select>
              <Option value="zh_CN">中文</Option>
              <Option value="es">英文</Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="fakerType"
            label="Faker 类型"
            rules={[{ required: true, message: '请选择 Faker 类型' }]}
          >
            <Select placeholder="选择 Faker 类型">
              {Object.entries(fakerStrategies).map(([key, { label, desc }]) => (
                <Option key={key} value={key} title={desc}>{label}</Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="args"
            label="参数 (可选)"
          >
            <Input placeholder="如果需要参数，请在此输入" />
          </Form.Item>

          <Form.Item>
          <Space>
              <Button type="primary" htmlType="submit">
                保存配置
              </Button>
              {/* 添加刷新插件按钮 */}
              <Button type="default" onClick={reloadExtension}>
                刷新菜单项
              </Button>
            </Space>
            <label style={{ color: 'red', fontSize: '14px'}}> 点击“刷新菜单”生效.页面将在500毫秒后刷新. </label> 
          </Form.Item>
        </Form>

        <Divider />
        
        <Title level={5}>已保存的配置</Title>
        {userConfigs.length === 0 ? (
          <Text type="secondary">暂无保存的配置</Text>
        ) : (
          userConfigs.map(config => (
            <div key={config.id} style={{ marginBottom: 10, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <Text strong>{config.name}</Text>
                <Text type="secondary" style={{ marginLeft: 8 }}>
                  ({fakerStrategies[config.fakerType]?.label || config.fakerType})
                </Text>
              </div>
              <Button danger size="small" onClick={() => deleteConfig(config.id)}>
                删除
              </Button>
            </div>
          ))
        )}
      </Modal>
    </>
  );
}