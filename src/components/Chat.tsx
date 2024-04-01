import React, { useState, useRef, useEffect, useContext } from 'react';
import { TextField, List, Avatar, Box, InputAdornment, IconButton, FormHelperText, Typography, useTheme, useMediaQuery } from '@mui/material';
import { ThemeProvider } from '@mui/material/styles';
import { Adjust, ArrowUpward, ArrowDownward } from '@mui/icons-material';
import { ChatProps, ChatInputProps, IChatContext } from '../utils/types';
import { useChat } from '../utils/useChat';
import { theme, flexCC } from '../utils/style'
import openai from '../img/openai.svg';
import mai from '../img/logo192.png'
import MessageItem from './MessageItem';
//父组件全局数据
const ChatContext = React.createContext<IChatContext>({
  isSending: false,
  setIsSending: () => { },
  aiModel: '',
  apiKey: '',
  resendQuestion: () => { },
  changeContent: () => { }, toggleEdit: () => { }, handleResubmitQuestion: () => { },
});

//判断是否是chatgpt
const isChatGPT = (aiModel: string) => {
  return aiModel && aiModel.split('/')[0] === 'openai' ? 'ChatGPT' : 'MistralAI';
}

//头像组件
const AvatarIcon: React.FC<{ role?: string, aiModel: string }> = ({ role, aiModel }) => {
  const isChatGPT = aiModel && aiModel.split('/')[0] === 'openai';
  let src = isChatGPT ? openai : mai;
  let style = { width: 32, height: 32, mb: 3, border: '1px solid #B2BAC2', p: 1 }
  return (
    <Avatar sx={style} src={src}></Avatar>
  );
};

//聊天欢迎语组件
const ChatWelcomeMessage = () => {
  const { aiModel } = useContext(ChatContext);
  return (
    <Box
      sx={{
        flex: 1,
        ...flexCC,
        flexDirection: 'column'
      }}
    >
      <AvatarIcon aiModel={aiModel}></AvatarIcon>
      <Typography
        variant="h4"
        sx={{
          fontSize: 26,
          color: '#000',
          fontWeight: 'bold',
          textAlign: 'center',
        }}
      >
        我今天能帮你做什么？
      </Typography>
    </Box>
  );
};

//输入框组件
const InputCom: React.FC<ChatInputProps & { isMobile: boolean, scrollToBottom: () => void }> = ({ apiKey, sendMessage, isMobile, scrollToBottom }) => {
  const { isSending, setIsSending, aiModel } = useContext(ChatContext);
  const currentAiModel = isChatGPT(aiModel);  //模型类型
  const [inputValue, setInputValue] = useState(''); //输入框
  const [inputKey, setInputKey] = useState(0);  //输入框key，使其输入完成后重置
  //发送信息
  const handleMessageSend = () => {
    if (!isSending) {
      scrollToBottom();
      setIsSending(true);   //设置loading
      sendMessage(inputValue, () => setIsSending(false));
      setInputValue('');
      setInputKey(prevKey => prevKey + 1);
    }
  };
  return (
    <Box>
      <Box sx={{ position: 'relative', width: '100%' }}>
        <TextField
          key={inputKey}
          fullWidth
          multiline
          maxRows={8}
          variant="outlined"
          autoComplete="off"
          value={inputValue}
          disabled={!apiKey}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder={apiKey.length > 0 ? `发送消息给${currentAiModel}...` : '请先输入上面的api key，才能开启聊天'}
          onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleMessageSend()}
          InputProps={{
            sx: {
              borderRadius: 4,
              '&::-webkit-scrollbar': {
                width: 4, // 控制滚动条的宽度
              },
              '&::-webkit-scrollbar-thumb': {
                backgroundColor: 'rgba(0,0,0,0.1)', // 控制滚动条的颜色和透明度
              },
              scrollbarWidth: 'thin', /* Firefox */
              scrollbarColor: 'rgba(0,0,0,0.1) transparent',
            },
          }}
          sx={{
            width: '100%',
            flexGrow: 1,
            pr: 40,
            ".MuiInputLabel-outlined": {
              fontSize: isMobile ? 14 : 'auto',
              mt: isMobile ? -8 : '0',
            },

          }}
        />
        {apiKey.length > 0 && (
          <Box sx={{ position: 'absolute', bottom: 28, right: 10 }}>
            <InputAdornment position="end" >
              {isSending && <Adjust sx={{ color: '#000' }} />}
              {inputValue.length > 0 && !isSending && <IconButton
                onClick={handleMessageSend}
                disabled={isSending}
                sx={{
                  width: isMobile ? 24 : 30,
                  height: isMobile ? 24 : 30,
                  backgroundColor: '#000',
                  borderRadius: 2,
                  '&:hover': {
                    backgroundColor: '#aeaeae',
                  }
                }}
              >
                <ArrowUpward sx={{ color: '#fff', fontSize: isMobile ? 18 : 20 }} />
              </IconButton>}
            </InputAdornment>
          </Box>)}
      </Box>
      <FormHelperText sx={{ textAlign: 'center', my: 1 }}>{currentAiModel}可能会犯错误。请考虑核实重要信息。</FormHelperText>
    </Box>
  )
};

//聊天组件整体输出
const Chat: React.FC<ChatProps> = ({ apiKey, aiModel }) => {
  const { messages, sendMessage, resendQuestion, changeContent, updateMessageShowActions, toggleEdit, handleResubmitQuestion } = useChat(apiKey, aiModel);
  const messagesEndRef = useRef<HTMLDivElement>(null);  //控制页面滚动
  const [isSending, setIsSending] = useState(false);  //是否请求中
  const themes = useTheme();
  const isMobile = useMediaQuery(themes.breakpoints.down('sm'));
  const [showScrollButton, setShowScrollButton] = useState(false);
  // 发送消息后滚动到底部的函数
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // 在每次消息列表更新后调用滚动到底部的函数
  useEffect(() => {
    if (messages[messages.length - 1]?.loading) {
      scrollToBottom()
    }
  }, [messages]);

  //模块鼠标经过
  const handleMouseEnter = (index: number) => {
    updateMessageShowActions(index, true);
  }
  //模块鼠标移开
  const handleMouseLeave = (index: number) => {
    if (index === messages.length - 1) return;
    updateMessageShowActions(index, false);
  }

  //监听滚动条
  const handleListScroll = (event: React.UIEvent<HTMLElement>) => {
    const target = event.currentTarget;
    const atBottom = target.scrollHeight - target.scrollTop === target.clientHeight;
    setShowScrollButton(!atBottom);
  };


  return (
    <ChatContext.Provider value={{ isSending, setIsSending, aiModel, apiKey, resendQuestion, changeContent, toggleEdit, handleResubmitQuestion }}>
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          width: '100%',
          height: '100%',
          overflow: 'hidden',
        }}
      >
        <Box
          sx={{
            width: '100%',
            height: '100%',
            mx: 'auto',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            bgcolor: 'background.paper', // 使用主题中的背景颜色
          }}
        >
          {messages.length === 0 && <ChatWelcomeMessage></ChatWelcomeMessage>}
          <List sx={{ overflowY: 'auto', px: 1, py: 2, '&::-webkit-scrollbar': { display: 'none' } }} onScroll={handleListScroll}>
            {messages.length > 0 && messages.map((message, index) => (
              <Box sx={{ position: 'relative' }} key={`message-${message.id}-${index}`} onMouseEnter={() => handleMouseEnter(index)}
                onMouseLeave={() => handleMouseLeave(index)}>
                <MessageItem message={message} length={messages.length} isMobile={isMobile} index={index} />
              </Box>
            ))}
            <div ref={messagesEndRef} />
          </List>
          <ThemeProvider theme={theme}>
            <InputCom apiKey={apiKey} sendMessage={sendMessage} isMobile={isMobile} scrollToBottom={scrollToBottom}></InputCom>
          </ThemeProvider>
        </Box>
        {/* 下拉按钮 */}
        {showScrollButton && (
          <IconButton
            sx={{
              position: 'fixed',
              bottom: '110px',
              right: 'center',
              border: '1px solid #DEDEDE',
              width: 36,
              height: 36,
              zIndex: 5
            }}
            onClick={scrollToBottom}
          >
            <ArrowDownward sx={{ color: '#000', fontSize: 22 }} />
          </IconButton>
        )}
      </Box>
    </ChatContext.Provider>
  );
};
export const useChatContext = () => useContext(ChatContext);  //输出父数据useContext
export default Chat;
