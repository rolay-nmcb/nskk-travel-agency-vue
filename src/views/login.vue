<template>
  <div class="login-container">
    <!-- 背景视频容器 -->
    <div class="background-wrapper">
      <video
        ref="bgVideo"
        class="bg-video"
        src="../assets/video/loginbackground.mp4"
        autoplay
        loop
        playsinline
        :muted="isMuted"
      ></video>
      <!-- 渐变遮罩增强文字可读性 -->
      <div class="video-overlay"></div>
    </div>

    <!-- 静音按钮 -->
    <button class="mute-btn" @click="toggleMute" aria-label="切换声音">
      <span v-if="isMuted" class="sound-icon">🔇</span>
      <span v-else class="sound-icon">🔊</span>
    </button>

    <!-- 登录卡片 -->
    <div class="login-card">
      <!-- 品牌区域 -->
      <div class="brand-section">
        <div class="brand-logo">✈️</div>
        <h1 class="brand-name">纳斯卡可旅行社</h1>
        <p class="brand-slogan">探索世界，从这里开始</p>
      </div>

      <!-- 登录表单 -->
      <el-form ref="loginRef" :model="loginForm" :rules="loginRules" class="login-form">
        <el-form-item prop="username">
          <el-input
            v-model="loginForm.username"
            type="text"
            size="large"
            auto-complete="off"
            placeholder="账号"
            class="custom-input"
          >
            <template #prefix><svg-icon icon-class="user" class="input-icon" /></template>
          </el-input>
        </el-form-item>
        
        <el-form-item prop="password">
          <el-input
            v-model="loginForm.password"
            type="password"
            size="large"
            auto-complete="off"
            placeholder="密码"
            @keyup.enter="handleLogin"
            class="custom-input"
          >
            <template #prefix><svg-icon icon-class="password" class="input-icon" /></template>
          </el-input>
        </el-form-item>
        
        <el-form-item prop="code" v-if="captchaEnabled" class="code-group">
          <el-input
            v-model="loginForm.code"
            size="large"
            auto-complete="off"
            placeholder="验证码"
            @keyup.enter="handleLogin"
            class="custom-input code-input"
          >
            <template #prefix><svg-icon icon-class="validCode" class="input-icon" /></template>
          </el-input>
          <div class="code-image-container">
            <img :src="codeUrl" @click="getCode" class="code-image" alt="验证码" />
          </div>
        </el-form-item>
        
        <div class="form-actions">
          <el-checkbox v-model="loginForm.rememberMe" class="remember-checkbox">
            记住密码
          </el-checkbox>
          
          <el-button
            :loading="loading"
            size="large"
            type="primary"
            class="login-button"
            @click.prevent="handleLogin"
          >
            <span v-if="!loading">登 录</span>
            <span v-else>登 录 中...</span>
          </el-button>
          
          <router-link class="register-link" :to="'/register'" v-if="register">
            没有账号？立即注册
          </router-link>
        </div>
      </el-form>
    </div>

    <!-- 页脚 -->
    <footer class="page-footer">
      <span>Copyright © 2018-2023 ruoyi.vip All Rights Reserved.</span>
    </footer>
  </div>
</template>

<script setup>
// 保持原有脚本逻辑不变
import { getCodeImg } from "@/api/login";
import Cookies from "js-cookie";
import { encrypt, decrypt } from "@/utils/jsencrypt";
import useUserStore from '@/store/modules/user'
import { useRoute, useRouter } from 'vue-router'
import { getCurrentInstance, ref, watch } from 'vue'

const userStore = useUserStore()
const route = useRoute();
const router = useRouter();
const { proxy } = getCurrentInstance();
const isMuted = ref(true);
const bgVideo = ref(null);

const loginForm = ref({
  username: "admin",
  password: "admin123",
  rememberMe: false,
  code: "",
  uuid: ""
});

const loginRules = {
  username: [{ required: true, trigger: "blur", message: "请输入您的账号" }],
  password: [{ required: true, trigger: "blur", message: "请输入您的密码" }],
  code: [{ required: true, trigger: "change", message: "请输入验证码" }]
};

const codeUrl = ref("");
const loading = ref(false);
const captchaEnabled = ref(true);
const register = ref(true);
const redirect = ref(undefined);

watch(route, (newRoute) => {
    redirect.value = newRoute.query && newRoute.query.redirect;
}, { immediate: true });

function handleLogin() {
  proxy.$refs.loginRef.validate(valid => {
    if (valid) {
      loading.value = true;
      if (loginForm.value.rememberMe) {
        Cookies.set("username", loginForm.value.username, { expires: 30 });
        Cookies.set("password", encrypt(loginForm.value.password), { expires: 30 });
        Cookies.set("rememberMe", loginForm.value.rememberMe, { expires: 30 });
      } else {
        Cookies.remove("username");
        Cookies.remove("password");
        Cookies.remove("rememberMe");
      }
      userStore.login(loginForm.value).then(() => {
        const query = route.query;
        const otherQueryParams = Object.keys(query).reduce((acc, cur) => {
          if (cur !== "redirect") {
            acc[cur] = query[cur];
          }
          return acc;
        }, {});
        router.push({ path: redirect.value || "/", query: otherQueryParams });
      }).catch(() => {
        loading.value = false;
        if (captchaEnabled.value) {
          getCode();
        }
      });
    }
  });
}

function getCode() {
  getCodeImg().then(res => {
    captchaEnabled.value = res.captchaEnabled === undefined ? true : res.captchaEnabled;
    if (captchaEnabled.value) {
      codeUrl.value = "data:image/gif;base64," + res.img;
      loginForm.value.uuid = res.uuid;
    }
  });
}

function getCookie() {
  const username = Cookies.get("username");
  const password = Cookies.get("password");
  const rememberMe = Cookies.get("rememberMe");
  loginForm.value = {
    username: username === undefined ? loginForm.value.username : username,
    password: password === undefined ? loginForm.value.password : decrypt(password),
    rememberMe: rememberMe === undefined ? false : Boolean(rememberMe)
  };
}

function toggleMute() {
  isMuted.value = !isMuted.value;
  if (bgVideo.value) {
    bgVideo.value.muted = isMuted.value;
  }
}

getCode();
getCookie();
</script>

<style lang='scss' scoped>
// 基础样式重置
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

.login-container {
  min-height: 100vh;
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 20px;
}

// 背景视频样式
.background-wrapper {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  overflow: hidden;
  z-index: -1;
}

.bg-video {
  width: 100%;
  height: 100%;
  object-fit: cover;
  filter: brightness(0.7); // 降低亮度增强文字可读性
}

.video-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(
    to right,
    rgba(0, 0, 0, 0.5),
    rgba(0, 0, 0, 0.2) 50%,
    rgba(0, 0, 0, 0.5)
  );
}

// 静音按钮
.mute-btn {
  position: absolute;
  top: 24px;
  right: 24px;
  z-index: 10;
  background: rgba(255, 255, 255, 0.15);
  backdrop-filter: blur(8px);
  border: none;
  color: #fff;
  font-size: 20px;
  border-radius: 50%;
  width: 44px;
  height: 44px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);

  &:hover {
    background: rgba(255, 255, 255, 0.25);
    transform: scale(1.05);
  }
}

// 登录卡片样式
.login-card {
  width: 100%;
  max-width: 420px;
  background: rgba(255, 255, 255, 0.95);
  border-radius: 16px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.15);
  overflow: hidden;
  transition: transform 0.3s ease;

  &:hover {
    transform: translateY(-5px);
  }
}

// 品牌区域样式
.brand-section {
  padding: 40px 30px 20px;
  text-align: center;
  background: linear-gradient(135deg, #1e88e5, #2196f3);

  .brand-logo {
    font-size: 48px;
    margin-bottom: 16px;
    color: white;
  }

  .brand-name {
    color: white;
    font-size: 24px;
    font-weight: 600;
    margin-bottom: 8px;
  }

  .brand-slogan {
    color: rgba(255, 255, 255, 0.85);
    font-size: 14px;
    letter-spacing: 0.5px;
  }
}

// 表单样式
.login-form {
  padding: 30px;
}

.custom-input {
  width: 100%;
  margin-bottom: 16px;
  border-radius: 8px;
  border: 1px solid #e0e0e0;
  transition: all 0.2s ease;

  &:focus-within {
    border-color: #2196f3;
    box-shadow: 0 0 0 3px rgba(33, 150, 243, 0.1);
  }

  .el-input__inner {
    height: 50px;
    border: none;
    padding: 0 16px;
    font-size: 15px;
  }
}

.input-icon {
  color: #9e9e9e;
  margin-right: 8px;
}

// 验证码区域
.code-group {
  display: flex;
  gap: 12px;
  margin-bottom: 16px;
}

.code-input {
  flex: 1;
  margin-bottom: 0;
}

.code-image-container {
  width: 120px;
  height: 50px;
  border-radius: 8px;
  overflow: hidden;
  cursor: pointer;
  border: 1px solid #e0e0e0;
}

.code-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.2s ease;

  &:hover {
    transform: scale(1.05);
  }
}

// 表单操作区
.form-actions {
  display: flex;
  flex-direction: column;
  gap: 16px;
  margin-top: 10px;
}

.remember-checkbox {
  align-self: flex-start;
  color: #616161;
  font-size: 14px;

  .el-checkbox__label {
    padding-left: 6px;
  }
}

.login-button {
  height: 50px;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 500;
  background: #2196f3;
  border: none;
  transition: all 0.3s ease;

  &:hover {
    background: #1976d2;
  }

  &:active {
    background: #1565c0;
  }
}

.register-link {
  align-self: center;
  color: #2196f3;
  font-size: 14px;
  text-decoration: none;
  transition: color 0.2s ease;

  &:hover {
    color: #1976d2;
    text-decoration: underline;
  }
}

// 页脚样式
.page-footer {
  position: absolute;
  bottom: 0;
  width: 100%;
  padding: 20px;
  text-align: center;
  color: rgba(255, 255, 255, 0.7);
  font-size: 12px;
  letter-spacing: 0.3px;
  background: rgba(0, 0, 0, 0.3);
  backdrop-filter: blur(4px);
}

// 响应式调整
@media (max-width: 576px) {
  .login-card {
    width: 100%;
    margin: 0 10px;
  }

  .brand-section {
    padding: 30px 20px 15px;
  }

  .login-form {
    padding: 20px;
  }

  .code-image-container {
    width: 100px;
  }
}
</style>