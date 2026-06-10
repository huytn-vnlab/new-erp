/**
 * permission store — user module permissions.
 * Replaces: store/modules/permissions.ts
 */
import { defineStore } from 'pinia'

export const usePermissionStore = defineStore('permission', () => {
  const modules = ref<string[]>([])

  function setModules(list: string[]) {
    modules.value = list
  }

  function hasModule(module: string): boolean {
    return modules.value.includes(module)
  }

  return { modules, setModules, hasModule }
})
