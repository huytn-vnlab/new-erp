import { defineRule, configure } from 'vee-validate'
import { required, email, min, max, numeric, min_value, max_value } from '@vee-validate/rules'
import { localize, setLocale } from '@vee-validate/i18n'

// ── Inline locale messages ──────────────────────────────────────────────────
// We define messages inline instead of importing JSON files from @vee-validate/i18n
// to avoid Vite's JSON plugin clashing with @nuxtjs/i18n's JSON transform.
const viMessages = {
  messages: {
    required:  'Trường này là bắt buộc',
    email:     'Email không hợp lệ',
    min:       'Trường này phải có ít nhất 0:{min} ký tự',
    max:       'Trường này không được quá 0:{max} ký tự',
    numeric:   'Trường này chỉ được nhập số',
    min_value: 'Giá trị phải lớn hơn hoặc bằng 0:{min}',
    max_value: 'Giá trị phải nhỏ hơn hoặc bằng 0:{max}',
    confirmed: 'Xác nhận không khớp',
  },
}

const enMessages = {
  messages: {
    required:  'This field is required',
    email:     'This field must be a valid email',
    min:       'This field must be at least 0:{min} characters',
    max:       'This field may not be greater than 0:{max} characters',
    numeric:   'This field must be a number',
    min_value: 'This field must be 0:{min} or more',
    max_value: 'This field must be 0:{max} or less',
    confirmed: 'This field confirmation does not match',
  },
}

const jaMessages = {
  messages: {
    required:  'このフィールドは必須です',
    email:     '有効なメールアドレスを入力してください',
    min:       '{field}は0:{min}文字以上で入力してください',
    max:       '{field}は0:{max}文字以内で入力してください',
    numeric:   '数字のみ入力できます',
    min_value: '0:{min}以上の値を入力してください',
    max_value: '0:{max}以下の値を入力してください',
    confirmed: '確認入力が一致しません',
  },
}

export default defineNuxtPlugin(() => {
  // ── Built-in rules ──────────────────────────────────────────────────────
  defineRule('required', required)
  defineRule('email', email)
  defineRule('min', min)
  defineRule('max', max)
  defineRule('numeric', numeric)
  defineRule('min_value', min_value)
  defineRule('max_value', max_value)

  // ── Custom rules ─────────────────────────────────────────────────────────

  // Vietnamese phone number (Viettel / Mobifone / Vinaphone / …)
  defineRule('phone_vn', (value: string) => {
    if (!value) return true
    return /^(0[3|5|7|8|9])+([0-9]{8})$/.test(value)
      || 'Số điện thoại không hợp lệ'
  })

  // Confirm password
  defineRule('confirmed', (value: string, [target]: string[]) => {
    return value === target || 'Mật khẩu xác nhận không khớp'
  })

  // Date range: end must be >= start
  defineRule('date_after_or_equal', (value: string, [target]: string[]) => {
    if (!target) return true
    return value >= target || 'Ngày kết thúc phải sau ngày bắt đầu'
  })

  // ── i18n messages ────────────────────────────────────────────────────────
  configure({
    generateMessage: localize({ vi: viMessages, en: enMessages, ja: jaMessages }),
  })

  setLocale('vi')
})
