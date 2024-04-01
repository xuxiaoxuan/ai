import React, { useState } from 'react';
import { TextField, CircularProgress, ListItem, Avatar, Box, IconButton, Typography, Tooltip, Button } from '@mui/material';
import { AccountCircle, NavigateBefore, NavigateNext, Replay, ContentCopy, Check, Edit } from '@mui/icons-material';
import { MessageItemProps, MessageActionsProps, IconTooltipProps } from '../utils/types';
import { flexCC, textNoBorder } from '../utils/style'
import chatGpt from '../img/chatgpt-icon.svg'
import mai from '../img/logo192.png'
import { useChatContext } from './Chat';

//判断是否是chatgpt
const isChatGPT = (aiModel: string) => {
  return aiModel.split('/')[0] === 'openai' ? 'ChatGPT' : 'MistralAI';
}

//头像组件
const AvatarIcon: React.FC<{ role?: string, aiModel: string }> = ({ role, aiModel }) => {
  const isChatGPT = aiModel.split('/')[0] === 'openai';
  let src = role === 'user' ? '' : isChatGPT ? chatGpt : mai
  let style = { width: 36, height: 36, mr: 1.2, ...(!isChatGPT && role !== 'user' ? { bgcolor: '#eaeaea', p: 0.7, boxSizing: 'border-box' } : { bgcolor: '#F5C242' }) }
  return (
    <Avatar sx={style} src={src}>
      {role === 'user' && <AccountCircle />}
    </Avatar>
  );
};

// 历史记录导航组件（格式：<当前页数/总页数>）
const HistoryNavigation = ({ currentIndex = 0, totalCount = 0, onPrevious = () => { }, onNext = () => { } }) => {
  if (totalCount <= 1) return null; // 如果只有一条记录，则不显示导航
  return (
    <Box sx={{ ...flexCC }}>
      <IconButton onClick={onPrevious} size="small" disabled={currentIndex <= 1}>
        <NavigateBefore sx={{ fontSize: 18 }} />
      </IconButton>
      <Typography variant="body2">
        {`${currentIndex} / ${totalCount}`}
      </Typography>
      <IconButton onClick={onNext} size="small" disabled={currentIndex >= totalCount}>
        <NavigateNext sx={{ fontSize: 18 }} />
      </IconButton>
    </Box>
  );
};

//信息下按钮组件
const MessageActions: React.FC<MessageActionsProps> = ({ message, index, length, currentIndex, setCurrentIndex }) => {
  const { setIsSending, resendQuestion, changeContent, toggleEdit, } = useChatContext();
  const [isCopy, setIsCopy] = useState(false); //是否复制
  const history = message.history ?? []
  //复制答案
  const handleCopyAnswer = async () => {
    try {
      await navigator.clipboard.writeText(message.content);
      setIsCopy(true);
    } catch (error) {
      setIsCopy(false);
      console.error('Failed to copy answer', error);
    }
  };

  //重新回答
  const handleResendQuestion = () => {
    setIsSending(true)
    if (message.question) {
      resendQuestion(message.question, () => {
        setIsSending(false)
        const nextIndex=Math.max(message.pageIndex + 1, history.length);
        setCurrentIndex(nextIndex);
      });
    }
  };

  //下一页
  const onNext = () => {
    if (currentIndex < history.length) {
      setIsCopy(false);
      changeContent(history[currentIndex], index, currentIndex + 1)
      setCurrentIndex(currentIndex + 1);
    }
  }

  //上一页
  const onPrevious = () => {
    if (currentIndex > 1) {
      setIsCopy(false);
      changeContent(history[currentIndex - 2], index, currentIndex - 1)
      setCurrentIndex(currentIndex - 1);
    }
  }

  const styleData = { fontSize: 18 }
  // 当个按钮组件
  const IconTooltip: React.FC<IconTooltipProps> = ({ title, onClick, IconComponent }) => (
    <Tooltip title={title}>
      <IconButton onClick={onClick}>
        <IconComponent sx={styleData} />
      </IconButton>
    </Tooltip>
  );

  return (
    <Box sx={{ display: 'flex' }}>
      {history && (<HistoryNavigation currentIndex={currentIndex} totalCount={history.length} onPrevious={onPrevious} onNext={onNext}></HistoryNavigation>)}
      {message.role !== 'user' && (
        <>
          <IconTooltip title="复制回答" onClick={handleCopyAnswer} IconComponent={isCopy ? Check : ContentCopy} />
          {index === length - 1 && (
            <IconTooltip title="重新生成" onClick={handleResendQuestion} IconComponent={Replay} />
          )}
        </>
      )}
      {message.role === 'user' && !message.editing && (
        <IconTooltip title="重新编辑" onClick={() => toggleEdit(index, true)} IconComponent={Edit} />
      )}
    </Box>
  )
};


//聊天信息展示组件
const MessageItem: React.FC<MessageItemProps> = ({ message, index, isMobile, length }) => {
  const { toggleEdit, handleResubmitQuestion } = useChatContext();
  const name = message.role === 'user' ? 'You' : isChatGPT(message.aiModel);  //信息发送者名字
  const [editedContent, setEditedContent] = useState(message.content);  //重新编辑的文本输入框内容
  const history = message.history ?? []
  const [currentIndex, setCurrentIndex] = useState(message.pageIndex || 1); //页码下标

  //保存并提交
  const save = () => {
    if (message.editing) {
      handleResubmitQuestion(index, editedContent, () => {
        setCurrentIndex(history.length + 1)
      });
    }
  };

  // 取消编辑
  const cancle = () => {
    toggleEdit(index, false)
  }

  const styleText = message.role === 'error' ? { p: 1, color: '#D44F49', border: '1px solid #D44F49', backgroundColor: 'rgba(239,68,68,0.1)' } : { color: '#000' };

  //重新编辑组件
  const TextArea = () => {
    return (
      <Box width='100%' sx={{ pl: 6 }}>
        <TextField
          fullWidth
          multiline
          variant="standard"
          value={editedContent}
          InputProps={{
            disableUnderline: true, // 去除底部边框
          }}
          sx={{ ...textNoBorder }}
          onChange={(e) => setEditedContent(e.target.value)}
        />
        <Box sx={{ textAlign: 'center' }}>
          <Button variant="contained" sx={{
            mr: 2, borderRadius: 2, backgroundColor: '#0ca37f', "&:hover": {
              backgroundColor: '#1b7f65',
            },
          }} onClick={save}>保存并提交</Button>
          <Button variant="outlined" sx={{
            borderRadius: 2, borderColor: '#dddddd', color: '#000', "&:hover": {
              borderColor: '#b6b4b4',
            },
          }} onClick={cancle}>取消</Button>
        </Box>
      </Box>
    )
  }

  //文字显示组件
  const TipContent = () => {
    return (
      <Typography component="div" variant="body1" sx={{ ml: 6, mb: isMobile ? 3 : 5, borderRadius: 2, whiteSpace: 'pre-wrap', wordBreak: 'break-word', ...styleText }}>
        {message.loading ? (
          <CircularProgress size={20} sx={{ color: '#6D6D6D' }} />
        ) : (
          <div>{message.content}</div>
        )}
      </Typography>)
  }


  return (
    <ListItem sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', padding: '0' }}>
      <Box sx={{ display: 'flex', alignItems: 'center' }}>
        <AvatarIcon role={message.role} aiModel={message.aiModel}></AvatarIcon>
        <Typography variant="subtitle2" sx={{ lineHeight: '1.2', fontSize: 18, fontWeight: 'bold' }}>
          {name}
        </Typography>
      </Box>
      {message.editing ? TextArea() : TipContent()}
      {message.showActions && (
        <Box sx={{ position: 'absolute', bottom: 0, left: 40 }}>
          <MessageActions index={index} length={length} message={message}
            currentIndex={currentIndex} setCurrentIndex={setCurrentIndex} ></MessageActions>
        </Box>
      )}
    </ListItem>
  );
};

export default MessageItem;
