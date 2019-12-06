<template>
  <transition name="modal">
    <div class="modal-mask">
      <div class="modal-wrapper p-0">
        <div class="modal-container p-0">
          <div class="modal-body p-0" id="modalExplainer">
            <div class="close" @click="closeModal">
              <i class="far fa-times-circle"></i>
            </div>
            <video width="100%" height="auto" autoplay muted controls>
              <source src="@/assets/explainer.mp4" type="video/mp4" />
              Your browser does not support the video tag.
            </video>
          </div>
        </div>
      </div>
    </div>
  </transition>
</template>

<script>
export default {
  name: 'Video',
  data() {
    return {};
  },
  props: ['shown'],
  methods: {
    closeModal() {
      return window.EventBus.$emit('video-close');
    }
  },
  async mounted() {
    
  }
};
</script>

<style lang="scss" scoped>
.modal-mask .modal-wrapper .modal-container {
  width: 60%;
  background-color: transparent;

  .modal-body {
    position: relative;
  }

  .close {
    position: absolute;
    top:1rem;
    right:1rem;
    font-size:30px;
    color:#fff;
    z-index:99999;
    cursor:pointer;
  }
}
</style>