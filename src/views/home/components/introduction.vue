<template>
  <el-carousel :interval="4000" type="card" height="400px" motion-blur="true">
    <el-carousel-item v-for="num in 6" :key="num">
      <div class="carousel-item">
        <img 
          :src="`/src/assets/images/introduction/${num}.jpg`" 
          :alt="`介绍图片 ${num}`"
          class="carousel-image"
          @error="handleImageError($event, num)"
        >
        <div class="carousel-caption">
          {{ imageCaptions[num - 1] }}
        </div>
      </div>
    </el-carousel-item>
  </el-carousel>
</template>

<script>
export default {
  data() {
    return {
      imageCaptions: [
        "",
        "",
        "",
        "",
        "",
        ""
      ]
    };
  },
  methods: {
    handleImageError(event, num) {
      event.target.src = '';
      event.target.alt = `图片 ${num} 加载失败`;
    }
  }
};
</script>

<style scoped>
.carousel-item {
  position: relative;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}

.carousel-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 4px;
  display: block;
}

.carousel-caption {
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  height: 56px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 22px;
  color: #fff;
  text-shadow: 0 2px 8px rgba(0,0,0,0.5);
  background: rgba(0,0,0,0.25); /* 底部半透明背景 */
  pointer-events: none;
  z-index: 2;
  border-bottom-left-radius: 4px;
  border-bottom-right-radius: 4px;
}

/* 图片加载失败时显示的占位样式 */
.carousel-image[src=""] {
  width: 100%;
  height: 100%;
  border: 1px dashed #ff4d4f;
  background-color: #fff1f0;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  color: #ff4d4f;
}

.carousel-image[src=""]::before {
  content: attr(alt);
}
</style>