import { useState } from 'react';
import { Message } from './types';
// const apiKey = "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";
export const useChat = (apiKey: string, aiModel: string) => {
  const [messages, setMessages] = useState<Message[]>([]);  //消息列表

  //接口请求
  const fetchChatResponse = async (content: string) => {
    const requestOptions = {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: aiModel,
        messages: [...messages, { role: 'user', content }].filter(msg => msg.role !== 'error').map(({ role, content }) => ({
          role,
          content
        })),
        max_tokens: 200,
        temperature: 0.7,   //AI回答的随机性，取值范围一般在0到1之间。太小，重复性文本高。太大，自由度高。
        top_p: 0.8, //控制“核采样”，用于确保多样性的技术。1.0意味着AI会考虑所有可能的继续生成的token
        presence_penalty: 0.0,  //控制模型生成新的话题的倾向，0会使模型更倾向于重复已有的信息
        frequency_penalty: 0.0  //控制模型重复已提到的信息的倾向，较高的值会抑制重复，较低的值会允许更多重复。
      })
    };

    try {
      const response = await fetch("https://openrouter.ai/api/v1/chat/completions", requestOptions);
      return await response.json();
    } catch (error) {
      console.error("Error sending message to AI:", error);
      return { error: { message: '发生错误，请重试' } };
    }
  };

  // 更新消息的特定状态
  const updateMessageProperty = (index: number, property: string, value: any) => {
    setMessages(currentMessages =>
      currentMessages.map((msg, i) =>
        i === index ? { ...msg, [property]: value } : msg
      )
    );
  }

  //更改消息的按钮状态
  const updateMessageShowActions = (index: number, show: boolean) => {
    updateMessageProperty(index, 'showActions', show);
  }

  //重新编辑 
  const toggleEdit = (index: number, show: boolean) => {
    updateMessageProperty(index, 'editing', show);
  };

  //发送消息
  const sendInitialMessages = (content: string) => {
    setMessages(currentMessages => [
      ...currentMessages,
      createUserMessage(content),
      createAssistantResponseMessage('a', 'Loading...', content)
    ]);
  };

  //创建个人消息
  const createUserMessage = (content: string): Message => ({
    role: 'user',
    content,
    aiModel,
    showActions: false,
    history: [content],
    pageIndex: 1,
    userHistory: {}
  });

  //创建ai回复消息
  const createAssistantResponseMessage = (role: string, content: string, question: string, id?: string):
    Message => ({
      role: role === 'a' ? 'assistant' : 'error',
      content,
      loading: content === 'Loading...' ? true : false,
      id: id || '',
      aiModel,
      question,
      history: [content],
      showActions: true,
      pageIndex: 1,
      userHistory: {}
    });


  //设置消息回复记录
  const sendMessage = async (content: string, callback: () => void) => {
    const leng = messages.length
    updateMessageShowActions(leng - 1, false)  //隐藏按钮
    sendInitialMessages(content);     // 首先发送消息
    const data = await fetchChatResponse(content);     // 然后获取聊天响应
    updateMessagesWithResponse(data, content, leng);     // 根据响应更新消息
    callback(); // 最后，执行回调函数
  };

  // 响应更新消息
  const updateMessagesWithResponse = (data: any, question: string, leng: number) => {
    setMessages(currentMessages => {
      // 移除加载状态的消息
      const newMessages = currentMessages.filter(msg => !msg.loading);
      // 处理聊天响应
      if (data.choices?.length > 0) {
        const preItem = newMessages[leng - 2] //创建新问题前的最后一项
        const { content } = data.choices[0].message
        const responseMessage = createAssistantResponseMessage('a', content, question, data.id);
        newMessages.push(responseMessage);
        // 处理userHistory
        if (preItem?.userHistory) {
          const curPageIndex = preItem.pageIndex - 1
          let curHistory = preItem.userHistory[curPageIndex] || []
          curHistory.push(newMessages[leng])
          curHistory.push(newMessages[leng + 1])
          preItem.userHistory[curPageIndex] = curHistory;
          newMessages[leng - 2] = preItem
        }
      } else if (data.error) {
        newMessages.push(createAssistantResponseMessage('e', data.error.message, data.id));
      }

      return newMessages;
    });
  };

  // 重新回答
  const resendQuestion = async (content: string, callback: () => void) => {
    const lastMessageIndex = messages.length - 1;
    updateMessageProperty(lastMessageIndex, 'loading', true); //增加loading状态
    try {
      const data = await fetchChatResponse(content);
      setMessages(currentMessages => {
        const newMessages = [...currentMessages]
        const editItem = newMessages[lastMessageIndex]
        // 确保有消息且没有错误
        if (data.choices?.length > 0) {
          const { content: aiContent } = data.choices[0].message
          //更新当前数据
          let updatedMessage = {
            ...editItem,
            content: aiContent,
            loading: false,
            history: [
              ...(editItem.history || []),
              aiContent
            ],
          };

          updatedMessage.pageIndex = updatedMessage.history.length - 1;
          const { actualIndex, preItem } = dealUserhistory(newMessages, lastMessageIndex, aiContent)
          if (actualIndex >= 0) {
            newMessages[actualIndex] = preItem
          }
          newMessages[lastMessageIndex] = updatedMessage

        } else if (data.error) {
          const updatedMessage = {
            ...editItem,
            content: data.error.message,
            loading: false, // 关闭 loading
          };
          newMessages[lastMessageIndex] = updatedMessage
        }

        return newMessages;
      });
    } catch (error) {
      console.error("Failed to fetch chat response:", error);
    } finally {
      callback();
    }
  };

  //更新该分支上的最后Userhistory，确保分页历史数据
  const dealUserhistory = (newMessages: Message[], lastMessageIndex: number, aiContent: string) => {
    const lastUserHistoryIndex = newMessages.slice(0, lastMessageIndex).reverse().findIndex(item => item.userHistory && item.userHistory[0]);
    let actualIndex = -1;
    let preItem = newMessages[actualIndex];
    if (lastUserHistoryIndex !== -1) {
      actualIndex = lastMessageIndex - 1 - lastUserHistoryIndex;  //反向查找的，需将索引转换回正向
      preItem = newMessages[actualIndex];
      if (preItem && preItem.userHistory) {
        const curPageIndex = preItem.pageIndex - 1;
        const curHistory = preItem.userHistory[curPageIndex] || [];
        if (curHistory.length > 0 && curHistory[curHistory.length - 1].history) {
          curHistory[curHistory.length - 1].history.push(aiContent);
        }
      }
    }
    return {
      actualIndex,
      preItem
    }
  }


  //更改当前的消息列表(在页码选择器中点击)
  const changeContent = (content: string, index: number, curPage: number) => {
    setMessages(currentMessages => {
      let updatedMessages = [...currentMessages];
      const targetMessage = { ...updatedMessages[index], content, pageIndex: curPage };
      if (targetMessage.userHistory) {
        // 获取当前页的历史记录内容
        const pageHistory = targetMessage.userHistory[curPage - 1] || []
        updatedMessages[index] = targetMessage;
        updatedMessages = updatedMessages.slice(0, index + 1);
        // 更新后续消息内容为历史记录中对应页的内容
        pageHistory.forEach((historyMsg, i) => {
          if (i > 0) {
            updatedMessages[index + i] = {
              ...historyMsg, // 更新为历史记录中的消息
              pageIndex:1,
              content:historyMsg.history[0]
            };
          }
        });
      } else {
        updatedMessages[index] = {
          ...updatedMessages[index],
          content,
          pageIndex: curPage
        };
      }
      return updatedMessages;
    });
  };

  //添加新回答到历史记录,处理数据分页存储
  const updateUserHistory = (messages: any[], index: number, newContent: string, data?: any) => {
    let updatedMessages = [...messages];
    let editedMessage = updatedMessages[index];
    const history = [...updatedMessages[index].history, newContent]
    const historyIndex = history.length - 2; // 当前编辑次数的索引
    if (!data) {
      const nextMessage = updatedMessages[index + 1]
      editedMessage = { ...editedMessage, editing: false, content: newContent, showActions: false, history, pageIndex: history.length }
      // 初始化或更新userHistory
      editedMessage.userHistory[historyIndex] = updatedMessages.slice(index);  // 将下标大于index的所有消息移动到userHistory中
      updatedMessages = updatedMessages.slice(0, index + 1);  // 移除index之后的消息，因为它们已经被移到userHistory中
      updatedMessages[index + 1] = { ...nextMessage, loading: true }
    }
    // 如果data存在，处理AI回应
    if (data) {
      if (data.choices?.length > 0) {
        updatedMessages[index + 1] = createAssistantResponseMessage('a', data.choices[0].message.content, newContent, data.id)
      } else if (data.error) {
        updatedMessages[index + 1] = createAssistantResponseMessage('e', data.error.message, newContent, data.id)
      }
      // 将新的AI回应也添加到userHistory的新一页中
      editedMessage.userHistory[historyIndex] = [editedMessage, updatedMessages[index + 1]];
      // 向前遍历，更新所有具有userHistory的消息
      for (let i = index - 1; i >= 0; i--) {
        if (updatedMessages[i].userHistory[0]) {
          const currentHistoryIndex = updatedMessages[i].pageIndex - 1;
          const updateIndex = updatedMessages[i].userHistory[currentHistoryIndex].length - 1 - 1;
          updatedMessages[i].userHistory[currentHistoryIndex][updateIndex] = editedMessage;
        }
      }
    }
    updatedMessages[index] = editedMessage;

    return updatedMessages;
  };

  // 重新编辑并提交问题
  const handleResubmitQuestion = async (index: number, newContent: string, callback: () => void) => {
    setMessages(currentMessages => updateUserHistory(currentMessages, index, newContent));
    const data = await fetchChatResponse(newContent);
    setMessages(currentMessages => updateUserHistory(currentMessages, index, newContent, data));
    callback();
  };

  return { messages, sendMessage, resendQuestion, changeContent, updateMessageShowActions, toggleEdit, handleResubmitQuestion };
};
