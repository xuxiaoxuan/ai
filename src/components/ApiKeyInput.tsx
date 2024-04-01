import React, { useState, useEffect } from 'react';
import { Box, TextField, InputAdornment, IconButton, MenuItem, Snackbar, Fade, useTheme, useMediaQuery, Checkbox, Avatar, ListItemIcon } from '@mui/material';
import { ThemeProvider } from '@mui/material/styles';
import { ApiKeyInputProps, SelectFieldProps, ApiKeyFieldProps } from '../utils/types';
import { Close as CloseIcon, Send as SendIcon, LocationSearching, CheckCircle, RadioButtonUnchecked } from '@mui/icons-material'
import { theme, selectTheme } from '../utils/style'



//头部整块组件，选择模型+输入spikey组件
const ApiKeyInput: React.FC<ApiKeyInputProps> = ({ setApiKey, setAiModel, currencies, aiModel }) => {
  const [toastMessage, setToastMessage] = useState(''); //是否显示snackbar
  const themes = useTheme();
  const isMobile = useMediaQuery(themes.breakpoints.down('sm'));
  return (
    <ThemeProvider theme={theme}>
      <Box sx={{
        height: '100%',
        display: 'flex',
        flexDirection: isMobile ? 'column' : 'row',
        alignItems: isMobile ? 'stretch' : 'center',
        justifyContent: 'space-between'
      }}><ThemeProvider theme={selectTheme}>
          <SelectField aiModel={aiModel} currencies={currencies} setAiModel={setAiModel} isMobile={isMobile} /></ThemeProvider>
        <ApiKeyField setApiKey={setApiKey} setToastMessage={setToastMessage} isMobile={isMobile} />
      </Box>
      <Snackbar
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
        open={toastMessage.length > 0}
        autoHideDuration={1000}
        onClose={() => { setToastMessage('') }}
        message={toastMessage}
        TransitionComponent={Fade}
        sx={{
          '& .MuiSnackbarContent-root': { backgroundColor: 'white', color: 'black' } // 设置背景色为白色，文字为黑色
        }}
      />
    </ThemeProvider>
  );
};

//选择模型组件
const SelectField: React.FC<SelectFieldProps & { isMobile: boolean }> = ({ currencies, setAiModel, isMobile, aiModel }) => {
  const styleData = isMobile ? { mb: 3, width: '100%', height: '36px' } : { mb: 1, width: '200px', height: 'auto' }
  const iconSize = { fontSize: 20 }
  return (

    <TextField
      select
      label="选择模型"
      defaultValue={currencies[0].value}
      onChange={(e) => setAiModel(e.target.value)}
      sx={{
        mr: 10, ...styleData,
        '.MuiOutlinedInput-input': {
          fontSize: isMobile ? '14px' : 'auto',
        },
      }}
      InputProps={{
        sx: {
          borderRadius: '16px',
          backgroundColor: '#fff',
        }
      }}
      SelectProps={{
        renderValue: (selected) => {
          const selectedItem = currencies.find((item) => item.value === selected);
          return selectedItem ? selectedItem.label : '';
        },
        MenuProps: {
          anchorOrigin: {
            vertical: 'bottom',
            horizontal: 'left',
          },
          transformOrigin: {
            vertical: 'top',
            horizontal: 'left',
          },
        },
      }}
    >
      {currencies.map((option) => (
        <MenuItem key={option.value} value={option.value}>
          <Box sx={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between' ,my:1}}>
            <Avatar sx={{width:20,height:20}} src={option.img}></Avatar>
            <Box sx={{ flex: 1, mx: 1.5, whiteSpace: 'normal' }}> 
              <Box sx={{ fontSize: '14px', color: '#000', overflow: 'hidden' }}>{option.label}</Box>
              <Box sx={{ fontSize: '14px', color: '#9b9b9b', overflow: 'hidden' }}>{option.subTitle}</Box>
            </Box>
            <Checkbox
              checked={aiModel === option.value}
              icon={<RadioButtonUnchecked sx={{ color: '#D6D6D6', ...iconSize }} />}
              checkedIcon={<CheckCircle sx={{ ...iconSize }} />}
              sx={{ pr: 0, ml: 2 }}
            />
          </Box>
        </MenuItem>
      ))}

    </TextField>
  );

};

//输入框组件
const ApiKeyField: React.FC<ApiKeyFieldProps & { isMobile: boolean }> = ({ setToastMessage, setApiKey, isMobile }) => {
  const [inputValue, setInputValue] = useState(localStorage.getItem('apiKey') || ''); //apikey的值
  const [isSubmit, setSubmit] = useState(false);  //是否提交

  useEffect(() => {
    // 组件加载时，从localStorage中读取并设置API密钥
    const storedApiKey = localStorage.getItem('apiKey');
    if (storedApiKey) {
      setInputValue(storedApiKey);
      setApiKey(storedApiKey);
      setSubmit(true);
    }
  }, [setApiKey]);

  //apikey输入框的提交
  const handleSubmit = () => {
    setSubmit(true);
    setToastMessage('提交成功～请开始你的聊天')
    setApiKey(inputValue);
    localStorage.setItem('apiKey', inputValue); // 将API密钥存储到localStorage中
  };

  //清除输入框
  const handleClearInput = () => {
    // localStorage.removeItem('apiKey');
    setSubmit(false);
    setInputValue('');
    setApiKey('');
  };

  //输入框的值发生变化
  const apikeyChange = (value: string) => {
    if (inputValue !== value) {
      setSubmit(false);
      setInputValue(value);
    }
  };

  return (
    <Box sx={{ flex: 1, display: 'flex', mb: 1 }}>
      <TextField
        label="请输入正确的API key"
        fullWidth
        variant="outlined"
        autoComplete="off"
        value={inputValue}
        onChange={(e) => apikeyChange(e.target.value)}
        onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
        sx={{
          flexGrow: 1,
          ".MuiOutlinedInput-root": {
            height: isMobile ? '36px' : 'auto',
          },
          ".MuiInputLabel-outlined": {
            fontSize: isMobile ? '14px' : 'auto',
            mt: isMobile ? '-8px' : '0',
          },
        }}
        InputProps={{
          sx: {
            borderRadius: '16px',
            backgroundColor: '#fff',
            fontSize: isMobile ? '14px' : 'auto',
            '& input:-webkit-autofill': {
              WebkitBoxShadow: '0 0 0 100px white inset',
              WebkitTextFillColor: '#000000',
              '&:-webkit-autofill': {
                WebkitBoxShadow: '0 0 0 100px white inset',
                WebkitTextFillColor: '#000000',
              },
            },
          },
          endAdornment: (
            <InputAdornment position="end">
              {inputValue && (
                <>
                  <CloseIcon onClick={handleClearInput} sx={{ fontSize: isMobile ? '14px' : '16px' }} />
                  {!isSubmit && (
                    <IconButton
                      onClick={handleSubmit}
                      disabled={inputValue.length === 0}
                      sx={{
                        width: isMobile ? '24px' : '30px',
                        height: isMobile ? '24px' : '30px',
                        ml: isMobile ? 1 : 2,
                        backgroundColor: '#000',
                        borderRadius: '30%',
                        '&:hover': {
                          backgroundColor: '#aeaeae',
                        }
                      }}>
                      <SendIcon sx={{ color: '#fff', fontSize: isMobile ? '14px' : '16px' }} />
                    </IconButton>
                  )}
                </>
              )}
            </InputAdornment>
          ),
        }}
      />
    </Box>)
};
export default ApiKeyInput;
