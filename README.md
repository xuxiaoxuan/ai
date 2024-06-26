# 模拟chatGPT聊天项目说明文档

## 功能介绍
### V1.0版本
**亮点总结：**
1、支持多模型切换：**同一聊天，可切换多模型**回答
2、**页面美观、流畅、UI还原度**高：高效模仿chatgpt交互效果
3、**用户体验拉满**：有打招呼、温馨提示、缓存apikey、请求loading、请求防抖、ai模型识别、请求自动滚动底部等等
4、**支持互动功能**：提供消息按钮，能复制、重发、翻页发送等
<br>
**功能介绍：**
1、顶部栏：
（注意：为了更方便体验，未按照ChatGpt的风格，做了一些修改）
- 支持选择ai模型，默认为`gpt-3.5-turbo-1106`
- **支持保留apikey**，有新的apikey输入则覆盖，方便用户使用
- 不输入apikey时，则不允许聊天
- 输入apikey后，有toast成功提示

2、聊天主界面功能：
- 支持请求交互，会有loading提示，避免页面无反应
- 支持点击发送按钮，聊天界面会自动更新，显示聊天内容。
- 支持复制功能，文本一键复制
- 支持**重新生成聊天内容**，可以**查看多个历史聊天内容**
- 支持自适应，兼容pc和手机端
- **【差异卖点】**支持**同一对话中，可以选择不同模型**，不同模型用不同logo展示，更方便识别 *（这个是ChatGpt所没有的，但是因为咱们接口支持，所以做了，这个可以作为产品的一个差异卖点）*

3、底部栏功能：
- 支持页面自动滚动底部，有新请求时，则**自动滚到底部**
- 不输入apikey时，提示用户得先输入才能聊天



## 项目运行步骤
第1步：双击解压缩文件包
第2步：选择“Ai-ChatGpt-app”文件夹，右键，用命令行窗口打开此文件
第3步：输入`npm install`,安装依赖包，等待安装成功
第4步：输入`npm run start`,运行项目，出现`webpack compiled successfully`就是运行成功了
第5步：打开浏览器，在地址栏输入`http://localhost:3000（示例）`（实际以命令行窗口上的loacl参数为准），就可以访问项目页面
第6步：输入此api key：`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`，并点击提交，便可开始聊天（）

## 项目资料介绍
>  说明：下面👇指介绍我添加的资料，其它为项目自带不介绍
>
- `src/components`: 是页面的各个组件
  - `src/components/ApiKeyInput.tsx`:是页面头部的ai模型选项框组件+apikey输入框组件
  - `src/components/MessageItem.tsx`:是当条信息的组件（包含信息下的所有按钮等）
  - `src/components/Chat.tsx`:是聊天界面的组件，包含`MessageItem`组件
- `src/img`:是图片资源
- `src/utils`:是工具类
  - `style.ts`:是样式文件，包含全局样式和组件样式
  - `types.ts`:是类型文件，包含全局类型和组件类型
  - `useChat.ts`:是聊天界面的逻辑，包含请求ai接口，生成聊天内容，生成新的聊天内容，重新编辑聊天内容等
- `src/home.tsx`:是首页，包含头部和聊天界面
- `src/App.tsx`:是根组件，包含首页
- `src/index.tsx`:是入口文件，包含根组件









#
