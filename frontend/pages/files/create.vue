<template>
  <div>
    <p class="mb-10 text-5xl font-bold leading-[3rem]">Upload file</p>
    <form @submit.prevent="submit">
      <div class="space-y-4">
        <label class="block max-w-sm cursor-pointer group">
          <input type="file" class="hidden" @change="updateFile" ref="file" />
          <span
            class="flex transition-colors border rounded-md hover:border-slate-400">
            <span v-if="file" class="flex-1 px-4 py-2">
              <span class="block font-bold text-black">{{ file.name }}</span>
              <span class="block">{{ prettySize }}</span>
            </span>
            <span v-else class="flex-1 px-4 py-2">
              <span>Select a file...</span>
            </span>
            <span
              class="flex items-center justify-center px-4 py-2 text-black transition-colors bg-slate-300 group-hover:bg-slate-400">
              Browse
            </span>
          </span>
        </label>
        <p
          v-if="errors.file"
          class="mt-1 space-x-2 text-sm font-bold text-red-500">
          <font-awesome-icon icon="exclamation-triangle" /><span>{{
            errors.file
          }}</span>
        </p>
      </div>

      <t-alert
        :show="!!errors.message"
        variant="danger"
        :dismissible="false"
        class="mt-8"
        >{{ errors.message }}</t-alert
      >
      <t-button class="mt-4">Upload</t-button>
    </form>
    <div></div>
  </div>
</template>

<script>
import { formMixin } from "~/mixins/formUtils"
import prettyBytes from "pretty-bytes"

export default {
  layout: "dashboard",
  middleware: "authed",
  mixins: [formMixin()],
  methods: {
    updateFile() {
      this.file = this.$refs.file.files[0]
    },
    async submit() {
      if (this.isFormLoading()) return
      if (!this.file) {
        this.errors = {
          file: "Please select a file",
        }
        return
      }
      this.setFormLoading(true)
      try {
        const formData = new FormData()
        formData.append("file", this.file)
        const response = await this.$axios.$post("/files/upload", formData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        })
        if (response.status === "success") {
          this.$router.push(`/files`)
          return
        }
        this.setFormLoading(false)
      } catch (error) {
        this.setFormLoading(false)
        if (error.response) {
          this.errors = error.response.data.data
        } else if (error.request) {
          this.errors = {
            message: "Could not contact the server",
          }
        } else {
          this.errors = {
            message: error.message,
          }
        }
      }
    },
  },
  computed: {
    prettySize() {
      if (!this.file) return ""
      return prettyBytes(this.file.size)
    },
  },
  data() {
    return {
      file: null,
      errors: {},
    }
  },
}
</script>
