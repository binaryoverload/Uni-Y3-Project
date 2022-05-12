<template>
  <div class="space-y-4">
    <form-input
      component="select"
      :options="options"
      label="File"
      required
      :value="value.file_id"
      @input="$emit('input', { ...value, file_id: $event })" />
    <form-input
      label="Destination"
      required
      :value="value.destination"
      @input="$emit('input', { ...value, destination: $event })" />
    <div class="flex space-x-1">
      <form-input
        component="select"
        :options="permissionOptions"
        label="User"
        placeholder="User"
        required
        v-model="userPerms" />
      <form-input
        component="select"
        :options="permissionOptions"
        label="Group"
        placeholder="Group"
        required
        v-model="groupPerms" />
      <form-input
        component="select"
        :options="permissionOptions"
        label="Other"
        placeholder="Other"
        required
        v-model="otherPerms" />
    </div>
    <p class="">
      <span class="font-bold">Permissions: </span
      >{{ value.permissions.toString(8).padStart(3, "0") }} (
      <span class="font-mono">
        {{ perms(value.permissions) }}
      </span>
      )
    </p>
  </div>
</template>

<script>
import { permsNumToLetter } from "~/utils/strings"

export default {
  props: {
    value: Object,
    errors: {
      type: Object,
      default: () => {
        return {}
      },
    },
  },
  methods: {
    perms(value) {
      return permsNumToLetter(value)
    },
  },
  computed: {
    permission() {
      const fullPerms =
        (this.userPerms || "0") +
        (this.groupPerms || "0") +
        (this.otherPerms || "0")

      return parseInt(fullPerms, 8)
    },
  },
  watch: {
    permission(newVal, _) {
      this.$emit("input", { ...this.value, permissions: newVal })
    },
  },
  data() {
    return {
      options: [],
      userPerms: null,
      groupPerms: null,
      otherPerms: null,
      permissionOptions: [
        { id: "0", name: "0 (---)" },
        { id: "4", name: "4 (r--)" },
        { id: "5", name: "5 (r-x)" },
        { id: "6", name: "6 (rw-)" },
        { id: "7", name: "7 (rwx)" },
      ],
    }
  },
  async fetch() {
    this.options = (await this.$axios.$get("/files")).data.map(opt => {
      return {
        id: opt.id,
        name: opt.name + " (" + new Date(opt.created_at).toLocaleString() + ")",
      }
    })
  },
}
</script>
