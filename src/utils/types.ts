// 使用类型别名简化重复类型定义
type AiModel = string;
type ApiKey = string;

// 聊天消息结构
export interface Message {
  role: 'user' | 'assistant' | 'error';
  content: string;
  aiModel: AiModel;
  pageIndex: number;
  id?: string;
  showActions?: boolean;
  loading?: boolean;
  question?: string;
  history: string[];
  editing?: boolean;
  userHistory: { [key: number]: Message[] };
}

  //头部ai模型组件属性
  export interface SelectFieldProps {
    aiModel: AiModel;     //ai模型
    setAiModel: (key: string) => void;  //设置ai模型
    currencies: { value: string; label: string,subTitle:string,img:string }[]; //ai模型列表
}

//头部apikey组件属性
export interface ApiKeyFieldProps {
    setToastMessage: (value: string) => void;   //设置toast提示语
    setApiKey: (key: string) => void;   //设置apikey
}

//页面头部ai模型+apikey属性
export interface ApiKeyInputProps extends SelectFieldProps {
    setApiKey: (key: string) => void; //设置apikey
}


//聊天输入框
export interface ChatInputProps {
    sendMessage: (message: string, callback: () => void) => void;   //设置聊天消息
    apiKey: ApiKey; //apikey
}


// 聊天页面的信息
export interface ChatProps {
  apiKey: ApiKey;   //apikey
  aiModel: AiModel;     //ai模型
}

//聊天页面的公共数据
export interface IChatContext extends ChatProps{
  isSending: boolean;   //是否请求中
  setIsSending: (isSending: boolean) => void;   //设置请求状态
  resendQuestion: (message: string, callback: () => void) => void;  //重新生成答案
  changeContent: (content: string, index: number, curPage: number) => void;     //更改当前消息
  toggleEdit: (index: number, show: boolean) => void;   //设置编辑状态
  handleResubmitQuestion: (index: number, newQuestion: string, callback: () => void) => void; //重新编辑且请求
}

//消息组件所共同需要的属性
export interface NeedChat{
    message:Message,    //当前消息
    length:number,      //消息数组长度
    index:number,       //当前下标
}

//消息文本组件（单个）
export interface MessageItemProps extends NeedChat{
    isMobile:boolean    //是否是小屏
}

//聊天记录的按钮组件数据
export interface MessageActionsProps  extends NeedChat{
    currentIndex:number,    //当前页数
    setCurrentIndex:(index:number)=>void    //设置页数
}

//聊天记录的按钮组件（单个）
export interface IconTooltipProps {
    title: string;  //按钮主题
    onClick: () => void;    //按钮事件
    IconComponent: React.ElementType; // 组件类型
  }
  

