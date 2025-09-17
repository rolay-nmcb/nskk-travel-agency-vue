<template>
  <div class="register-container">
    <!-- 静音按钮 -->
    <button class="mute-btn" @click="toggleMute">
      <span v-if="isMuted">🔇</span>
      <span v-else>🔊</span>
    </button>
    <!-- 背景视频 -->
    <div class="video-bg">
      <video 
        ref="backgroundVideo"
        autoplay 
        loop 
        :muted="isMuted"
        playsinline
        class="bg-video"
      >
        <source src="@/assets/video/registerbackground.mp4" type="video/mp4">
        您的浏览器不支持视频标签
      </video>
    </div>

    <!-- 注册表单容器 -->
    <div class="register-wrapper">
      <el-form 
        ref="registerRef" 
        :model="registerForm" 
        :rules="registerRules" 
        class="register-form"
      >
        <div class="form-header">
          <h3 class="title">纳斯卡可旅行社</h3>
          <p class="subtitle">创建您的账户，开启旅行之旅</p>
        </div>
        
        <el-form-item prop="username">
          <el-input 
            v-model="registerForm.username" 
            type="text" 
            size="large" 
            auto-complete="off" 
            placeholder="账号"
            class="custom-input"
          >
            <template #prefix><svg-icon icon-class="user" class="el-input__icon input-icon" /></template>
          </el-input>
        </el-form-item>
        
        <el-form-item prop="password">
          <el-input
            v-model="registerForm.password"
            type="password"
            size="large" 
            auto-complete="off"
            placeholder="密码"
            @keyup.enter="handleRegister"
            class="custom-input"
          >
            <template #prefix><svg-icon icon-class="password" class="el-input__icon input-icon" /></template>
          </el-input>
        </el-form-item>
        
        <el-form-item prop="confirmPassword">
          <el-input
            v-model="registerForm.confirmPassword"
            type="password"
            size="large" 
            auto-complete="off"
            placeholder="确认密码"
            @keyup.enter="handleRegister"
            class="custom-input"
          >
            <template #prefix><svg-icon icon-class="password" class="el-input__icon input-icon" /></template>
          </el-input>
        </el-form-item>
        
        <el-form-item prop="code" v-if="captchaEnabled">
          <el-input
            size="large" 
            v-model="registerForm.code"
            auto-complete="off"
            placeholder="验证码"
            style="width: 63%"
            @keyup.enter="handleRegister"
            class="custom-input"
          >
            <template #prefix><svg-icon icon-class="validCode" class="el-input__icon input-icon" /></template>
          </el-input>
          <div class="register-code">
            <img :src="codeUrl" @click="getCode" class="register-code-img"/>
          </div>
        </el-form-item>
        
        <el-form-item style="width:100%;">
          <el-button
            :loading="loading"
            size="large" 
            type="primary"
            style="width:100%;"
            @click.prevent="handleRegister"
            class="register-btn"
          >
            <span v-if="!loading">注 册</span>
            <span v-else>注 册 中...</span>
          </el-button>
          <div style="float: right; margin-top: 15px;">
            <router-link class="link-type" :to="'/login'">使用已有账户登录</router-link>
          </div>
        </el-form-item>
      </el-form>
    </div>

    <!-- 底部版权信息 -->
    <div class="el-register-footer">
      <span>Copyright © 2018-2023 ruoyi.vip All Rights Reserved.</span>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { ElMessageBox } from "element-plus";
import { getCodeImg, register } from "@/api/login";
import { useRouter } from 'vue-router';
import { getCurrentInstance } from 'vue';

const router = useRouter();
const { proxy } = getCurrentInstance();

// 注册表单数据
const registerForm = ref({
  username: "",
  password: "",
  confirmPassword: "",
  code: "",
  uuid: ""
});

// 视频相关
const backgroundVideo = ref(null);
const isMuted = ref(true); // 默认静音

// 切换静音状态
function toggleMute() {
  console.log("切换静音状态：", isMuted.value);
  isMuted.value = !isMuted.value;
  if (backgroundVideo.value) {
    backgroundVideo.value.muted = isMuted.value;
  }
}

// 密码验证
const equalToPassword = (rule, value, callback) => {
  if (registerForm.value.password !== value) {
    callback(new Error("两次输入的密码不一致"));
  } else {
    callback();
  }
};

// 表单验证规则
const registerRules = {
  username: [
    { required: true, trigger: "blur", message: "请输入您的账号" },
    { min: 2, max: 20, message: "用户账号长度必须介于 2 和 20 之间", trigger: "blur" }
  ],
  password: [
    { required: true, trigger: "blur", message: "请输入您的密码" },
    { min: 5, max: 20, message: "用户密码长度必须介于 5 和 20 之间", trigger: "blur" }
  ],
  confirmPassword: [
    { required: true, trigger: "blur", message: "请再次输入您的密码" },
    { required: true, validator: equalToPassword, trigger: "blur" }
  ],
  code: [{ required: true, trigger: "change", message: "请输入验证码" }]
};

// 验证码相关
const codeUrl = ref("");
const loading = ref(false);
const captchaEnabled = ref(true);

// 注册处理
function handleRegister() {
  proxy.$refs.registerRef.validate(valid => {
    if (valid) {
      loading.value = true;
      register(registerForm.value).then(res => {
        const username = registerForm.value.username;
        ElMessageBox.alert(
          `<font color='red'>恭喜你，您的账号 ${username} 注册成功！</font>`, 
          "系统提示", 
          {
            dangerouslyUseHTMLString: true,
            type: "success",
          }
        ).then(() => {
          router.push("/login");
        }).catch(() => {});
      }).catch(() => {
        loading.value = false;
        if (captchaEnabled.value) {
          getCode();
        }
      });
    }
  });
}

// 获取验证码
function getCode() {
  getCodeImg().then(res => {
    captchaEnabled.value = res.captchaEnabled === undefined ? true : res.captchaEnabled;
    if (captchaEnabled.value) {
      codeUrl.value = "data:image/gif;base64," + res.img;
      registerForm.value.uuid = res.uuid;
    }
  });
}

// 初始化
onMounted(() => {
  getCode();
  // 尝试自动播放带声音（部分浏览器可能限制）
  if (backgroundVideo.value) {
    backgroundVideo.value.play().catch(err => {
      console.log('自动播放失败:', err);
    });
  }
});
</script>

<style lang='scss' scoped>
.register-container {
  position: relative;
  min-height: 100vh;
  overflow: hidden;
}

/* 背景视频样式 */
.video-bg {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 1;
  
  .bg-video {
    object-fit: cover;
    width: 100%;
    height: 100%;
    filter: brightness(0.7); /* 稍微调暗视频增加文字可读性 */
  }
  
}

.mute-btn {
  position: absolute;
  top: 20px;
  left: 20px;
  background: rgba(0,0,0,0.4);
  border: none;
  color: #fff;
  font-size: 24px;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 100; /* 增大z-index值 */
}

/* 注册表单容器 */
.register-wrapper {
  position: relative;
  z-index: 10;
  display: flex;
  justify-content: flex-end;
  align-items: center;
  height: 100vh;
  padding-right: 10%;
}

/* 注册表单样式 */
.register-form {
  width: 400px;
  padding: 35px 30px;
  background-color: rgba(255, 255, 255, 0.15); /* 透明背景 */
  backdrop-filter: blur(10px); /* 毛玻璃效果 */
  border-radius: 12px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.18);
  
  .form-header {
    text-align: center;
    margin-bottom: 30px;
    
    .title {
      color: #fff;
      font-size: 24px;
      margin-bottom: 10px;
      text-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    
    .subtitle {
      color: rgba(255, 255, 255, 0.8);
      font-size: 14px;
    }
  }
  
  .custom-input {
    background-color: rgba(255, 255, 255, 0.2);
    border: 1px solid rgba(255, 255, 255, 0.3);
    border-radius: 6px;
    
    input {
      color: #fff;
      &::placeholder {
        color: rgba(255, 255, 255, 0.6);
      }
    }
    
    .input-icon {
      color: rgba(255, 255, 255, 0.7);
    }
  }
  
  .register-btn {
    background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
    border: none;
    height: 45px;
    font-size: 16px;
    transition: all 0.3s ease;
    
    &:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(79, 172, 254, 0.4);
    }
  }
  
  .link-type {
    color: rgba(255, 255, 255, 0.8);
    text-decoration: none;
    transition: color 0.3s;
    
    &:hover {
      color: #fff;
      text-decoration: underline;
    }
  }
  
  .el-input {
    height: 45px;
    
    input {
      height: 45px;
    }
  }
  
  .register-code {
    width: 33%;
    height: 45px;
    
    img {
      height: 100%;
      border-radius: 6px;
    }
  }
}

/* 底部版权信息 */
.el-register-footer {
  position: fixed;
  bottom: 0;
  width: 100%;
  height: 40px;
  line-height: 40px;
  text-align: center;
  color: rgba(255, 255, 255, 0.7);
  font-family: Arial;
  font-size: 12px;
  letter-spacing: 1px;
  z-index: 10;
  background-color: rgba(0, 0, 0, 0.1);
}

/* 适配不同屏幕 */
@media (max-width: 768px) {
  .register-wrapper {
    justify-content: center;
    padding-right: 0;
    padding: 0 20px;
  }
  
  .register-form {
    width: 100%;
    max-width: 350px;
  }
}
</style>