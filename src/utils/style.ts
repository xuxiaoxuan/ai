import { createTheme } from '@mui/material/styles';
import { outlinedInputClasses } from '@mui/material/OutlinedInput';
import deepmerge from '@mui/utils/deepmerge';

//更改textfield的样式
export const theme =
    createTheme({
        components: {
            // 修改清除按钮的颜色
            MuiSvgIcon: {
                styleOverrides: {
                    root: {
                        color: '#000',
                    },
                },
            },
            MuiTextField: {
                styleOverrides: {
                    root: {
                        '--TextField-brandBorderColor': '#DEDEDE',
                        '--TextField-brandBorderHoverColor': '#B2BAC2',
                        '--TextField-brandBorderFocusedColor': '#9b9b9b',
                        '& label.Mui-focused': {
                            color: '#666',
                        },
                    },
                },
            },
            MuiOutlinedInput: {
                styleOverrides: {
                    notchedOutline: {
                        borderColor: 'var(--TextField-brandBorderColor)',
                    },
                    root: {
                        [`&:hover .${outlinedInputClasses.notchedOutline}`]: {
                            borderColor: 'var(--TextField-brandBorderHoverColor)',
                        },
                        [`&.Mui-focused .${outlinedInputClasses.notchedOutline}`]: {
                            borderColor: 'var(--TextField-brandBorderFocusedColor)',
                        },
                    },
                },
            },

        },
    });
// 更改下拉框样式
const selectMenu =
    createTheme({
        components: {
            MuiOutlinedInput: {
                styleOverrides: {
                    notchedOutline: {
                        border: 'none'
                    },
                },
            },
            // 添加MenuItem的样式覆盖
            MuiMenu: {
                styleOverrides: {
                    paper: {
                        width: '320px',
                        border: '1px solid #e6e6e6',
                        marginTop: '8px',
                        borderRadius: '8px',
                        padding: '0px 6px !important'
                    },
                },
            },
            MuiMenuItem: {
                styleOverrides: {
                    root: {
                        // 覆盖选中项的背景色
                        '&.Mui-selected': {
                            backgroundColor: 'transparent !important',
                            '&:hover': {
                                backgroundColor: '#ECECEC  !important', // 鼠标悬浮时的背景色
                            },
                        },
                        '&:hover': {
                            borderRadius: '4px',
                            backgroundColor: '#ECECEC  !important', // 鼠标悬浮时的背景色
                        },

                    },
                },
            },
            MuiCheckbox: {
                styleOverrides: {
                    root: {

                        '&:hover': {
                            backgroundColor: 'transparent',
                        },
                    },
                },
            },
        },
    });

// 合并两个主题
export const selectTheme = deepmerge(theme, selectMenu);

// flex居中
export const flexCC = {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
}

// 去除textfield的边框
export const textNoBorder = {
    width: "100%",
    "& .MuiOutlinedInput-root": {
        "& fieldset": {
            border: "none", // 去除边框
        },
        "&:hover fieldset": {
            border: "none", // 鼠标悬停时去除边框
        },
        "&.Mui-focused fieldset": {
            border: "none", // 聚焦时去除边框
        },
    },
}
