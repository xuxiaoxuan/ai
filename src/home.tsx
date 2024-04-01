import React, { useState } from 'react';
import Chat from './components/Chat';
import ApiKeyInput from './components/ApiKeyInput';
import { Box, useMediaQuery, useTheme } from '@mui/material';
import xing from './img/xing.png'
import dian from './img/dian.png'
const App = () => {
  const [apiKey, setApiKey] = useState<string>('');
  const [aiModel, setAiModel] = useState<string>('openai/gpt-3.5-turbo-1106');
  const theme = useTheme();
  const isWidthUp1280 = useMediaQuery(theme.breakpoints.up('lg'));
  const currencies = [
    {
      value: 'openai/gpt-3.5-turbo-1106',
      label: 'GPT-3.5-turbo-1106',
      subTitle:'非常适合日常任务',
      img:dian
    },
    {
      value: 'mistralai/mistral-7b-instruct',
      label: 'Mistral 7B Instruct',
      subTitle:'我们最擅长用英语回答的模型，任何回复都只会用英文回应。',
      img:xing
    },
  ];  //模型数据
  const styleData = {
    maxWidth: '828px',
    width: !isWidthUp1280 ? '100%' : '728px',
    margin: 'auto',
    boxSizing: 'border-box',
    px: 2,
  }
  return (
    <Box sx={{
      width: '100%',
      height: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
    }}>

      {/* API key 输入 */}
      <Box sx={{ width: '100%', pt: 2, backgroundColor: '#f5f5f5' }}>
        <Box sx={{...styleData}}>
          <ApiKeyInput aiModel={aiModel} setApiKey={setApiKey} setAiModel={setAiModel} currencies={currencies} />
        </Box>

      </Box>

      {/* 聊天组件部分 */}
      <Box sx={{
        flex: 1, overflow: 'auto', ...styleData
      }}>
        <Chat apiKey={apiKey} aiModel={aiModel} />
      </Box>
    </Box>

  );
};

export default App;
