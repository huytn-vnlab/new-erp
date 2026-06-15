import withNuxt from './.nuxt/eslint.config.mjs'

export default withNuxt(
  {
    // Màn pre-dashboard khôi phục từ bản cũ (landing/login/organization).
    // Logic auth/API còn dùng `any` ở khối catch — sẽ được dọn khi rework ở plan migrate API.
    // Tạm hạ xuống warning để không chặn lint, vẫn hiển thị nhắc nhở.
    files: [
      'app/pages/index.vue',
      'app/pages/user/**',
      'app/pages/organization/**',
    ],
    rules: {
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/no-unused-vars': 'warn',
      'no-empty': 'warn',
    },
  },
)
