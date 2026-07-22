<script setup lang="ts">
import { X, FileText } from 'lucide-vue-next'
import Badge from '~/components/base/Badge.vue'
import Btn from '~/components/base/Button.vue'
import type { Asset } from '~/mocks/asset'
import { CATEGORY_META, ASSET_STATUS_META, formatVND } from '~/mocks/asset'

defineProps<{ asset: Asset; canManage?: boolean }>()
const emit = defineEmits<{ close: []; edit: [Asset]; delete: [Asset]; 'view-history': [Asset] }>()

const { t } = useI18n()
</script>

<template>
  <div class="fixed inset-0 z-50 flex items-center justify-center p-6">
    <div class="absolute inset-0 bg-foreground/40 backdrop-blur-sm" @click="emit('close')" />
    <div class="relative card-surface w-full max-w-lg rise overflow-hidden">
      <div class="p-5 border-b border-border/70 flex items-start justify-between">
        <div class="flex items-center gap-3">
          <span
            class="h-12 w-12 rounded-lg flex items-center justify-center text-[24px] font-bold shrink-0"
            :style="{ background: `${CATEGORY_META[asset.category].color}25`, color: CATEGORY_META[asset.category].color }"
          >{{ CATEGORY_META[asset.category].glyph }}</span>
          <div>
            <p class="text-[10.5px] uppercase tracking-wider font-semibold text-muted-foreground">
              {{ t(CATEGORY_META[asset.category].labelKey) }} · <span class="font-mono">{{ asset.id }}</span>
            </p>
            <h3 class="text-[18px] font-bold font-heading">{{ asset.name }}</h3>
            <p class="text-[12.5px] text-muted-foreground">{{ asset.spec }}</p>
          </div>
        </div>
        <button class="p-2 rounded-md hover:bg-muted text-muted-foreground" @click="emit('close')">
          <X :size="16" />
        </button>
      </div>

      <div class="p-5 grid grid-cols-2 gap-x-5 gap-y-4 text-[13px]">
        <div>
          <p class="text-[11px] uppercase font-semibold text-muted-foreground tracking-wider">{{ t('hrm.asset.detail.serialNumber') }}</p>
          <p class="font-mono mt-0.5">{{ asset.serial }}</p>
        </div>
        <div>
          <p class="text-[11px] uppercase font-semibold text-muted-foreground tracking-wider">{{ t('hrm.asset.detail.value') }}</p>
          <p class="font-bold tabular-nums mt-0.5">{{ formatVND(asset.value) }}</p>
        </div>
        <div>
          <p class="text-[11px] uppercase font-semibold text-muted-foreground tracking-wider">{{ t('hrm.asset.detail.user') }}</p>
          <p class="mt-0.5">
            <span v-if="asset.user">{{ asset.user }}</span>
            <span v-else class="italic text-muted-foreground">{{ t('hrm.asset.detail.unassigned') }}</span>
          </p>
        </div>
        <div>
          <p class="text-[11px] uppercase font-semibold text-muted-foreground tracking-wider">{{ t('hrm.asset.detail.branch') }}</p>
          <p class="mt-0.5">{{ asset.branch }}</p>
        </div>
        <div>
          <p class="text-[11px] uppercase font-semibold text-muted-foreground tracking-wider">{{ t('hrm.asset.detail.issuedDate') }}</p>
          <p class="font-mono mt-0.5">{{ asset.date }}</p>
        </div>
        <div>
          <p class="text-[11px] uppercase font-semibold text-muted-foreground tracking-wider">{{ t('hrm.asset.detail.status') }}</p>
          <div class="mt-0.5">
            <Badge :variant="ASSET_STATUS_META[asset.status].variant" dot>{{ t(ASSET_STATUS_META[asset.status].labelKey) }}</Badge>
          </div>
        </div>
      </div>

      <div class="px-5 py-3 border-t border-border/70 flex items-center justify-end gap-2">
        <Btn v-if="canManage" variant="ghost" size="sm" class="mr-auto text-red-500 hover:text-red-600" @click="emit('delete', asset)">{{ t('hrm.asset.detail.delete') }}</Btn>
        <Btn variant="ghost" size="sm" @click="emit('close')">{{ t('common.close') }}</Btn>
        <Btn variant="outline" size="sm" @click="emit('view-history', asset)"><FileText :size="13" /> {{ t('hrm.asset.detail.viewHistory') }}</Btn>
        <Btn v-if="canManage" variant="primary" size="sm" @click="emit('edit', asset)"><FileText :size="13" /> {{ t('hrm.asset.detail.edit') }}</Btn>
      </div>
    </div>
  </div>
</template>
