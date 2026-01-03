# 图标和资源文件说明

## 1. 插件图标

请将AI笔记的Logo图标放置在此目录下，需要以下尺寸：

- icon16.png (16x16)
- icon32.png (32x32)
- icon48.png (48x48)
- icon128.png (128x128)

可以使用你项目中的 `/public/knowbit_logo.png` 文件，调整为对应尺寸。

临时方案：如果没有图标，插件也可以正常运行，只是在浏览器工具栏上不会显示图标。

## 2. 微信公众号二维码

**重要！**请将微信公众号的二维码图片复制到插件根目录：

1. 从主项目复制 `/public/wechat_login.jpg` 到 `/browser-extension/wechat_login.jpg`
2. 或者使用相同的公众号二维码图片
3. 文件名必须为 `wechat_login.jpg`

如果没有这个文件，登录界面将无法显示二维码。
