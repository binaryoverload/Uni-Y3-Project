<template>
  <div>
    <div class="mb-10 -mt-8">
      <back-link :to="`/policies/${item.policy_id}`">Back to Policy</back-link>
      <div class="flex items-end">
        <p class="text-5xl font-bold leading-[3rem]">View policy item</p>
        <div class="flex ml-auto space-x-2">
          <refresh-button @click="$nuxt.refresh()" />
          <t-button @click="deletePolicyItem" variant="error" class="space-x-2">
            <font-awesome-icon icon="trash" />
            <span>Delete policy item</span>
          </t-button>
        </div>
      </div>
    </div>
    <div class="space-y-8">
      <div>
        <div>
          <p class="font-bold">Details</p>
          <p class="text-slate-600">These are details about the policy item.</p>
          <hr class="my-2" />
        </div>

        <div>
          <table>
            <tbody>
              <tr>
                <td class="pb-2 pr-40 font-bold">Type</td>
                <td class="pb-2 text-slate-600">{{ item.type }}</td>
              </tr>

              <!-- Command type -->
              <tr v-if="isCommand">
                <td class="pb-2 font-bold">Command</td>
                <td class="pb-2 text-slate-600">
                  {{ item.data.command }}
                </td>
              </tr>
              <tr v-if="isCommand">
                <td class="pb-2 font-bold">Arguments</td>
                <td class="pb-2 text-slate-600">
                  {{ item.data.args.join(" ") }}
                </td>
              </tr>
              <tr v-if="isCommand">
                <td class="pb-2 font-bold">Working directory</td>
                <td class="pb-2 text-slate-600">
                  <span v-if="item.data.working_directory">{{
                    item.data.working_directory
                  }}</span>
                  <unset v-else />
                </td>
              </tr>
              <tr v-if="isCommand">
                <td class="pb-2 font-bold align-top">Environment variables</td>
                <td class="pb-2 text-slate-600">
                  <span v-if="item.data.env" class="whitespace-pre-line">{{
                    Object.entries(item.data.env)
                      .map(v => v.join("="))
                      .join("\n")
                  }}</span>
                  <unset v-else />
                </td>
              </tr>

              <!-- package type -->
              <tr v-if="isPackage">
                <td class="pb-2 font-bold">Package action</td>
                <td class="pb-2 text-slate-600">
                  {{ item.data.action }}
                </td>
              </tr>
              <tr v-if="isPackage">
                <td class="pb-2 font-bold align-top">Packages</td>
                <td class="pb-2 text-slate-600">
                  <span class="whitespace-pre-line">{{
                    item.data.packages.join("\n")
                  }}</span>
                </td>
              </tr>

              <!-- file type -->
              <tr v-if="isFile">
                <td class="pb-2 font-bold">File ID</td>
                <td class="pb-2 text-slate-600">
                  {{ item.data.file_id }}
                </td>
              </tr>
              <tr v-if="isFile">
                <td class="pb-2 font-bold">Destination</td>
                <td class="pb-2 text-slate-600">
                  {{ item.data.destination }}
                </td>
              </tr>
              <tr v-if="isFile">
                <td class="pb-2 font-bold">Permissions</td>
                <td class="pb-2 text-slate-600">
                  {{ item.data.permissions.toString(8) }} ({{
                    perms(item.data.permissions)
                  }})
                </td>
              </tr>
              <tr v-if="isFile">
                <td class="pb-2 font-bold">Filename</td>
                <td class="pb-2 text-slate-600">
                  {{ item.data.name }}
                </td>
              </tr>
              <tr v-if="isFile">
                <td class="pb-2 font-bold">Size</td>
                <td class="pb-2 text-slate-600">
                  {{ size(item.data.size) }}
                </td>
              </tr>
              <tr v-if="isFile">
                <td class="pb-2 font-bold">Hash (MD5)</td>
                <td class="pb-2 text-slate-600">
                  {{ item.data.hash }}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { deletePolicyItem } from "~/utils/actions"
import { permsNumToLetter } from "~/utils/strings"
import prettyBytes from "pretty-bytes"

export default {
  middleware: "authed",
  layout: "dashboard",
  data() {
    return {
      item: {},
    }
  },
  computed: {
    isCommand() {
      return this.item.type === "command"
    },
    isPackage() {
      return this.item.type === "package"
    },
    isFile() {
      return this.item.type === "file"
    },
  },
  methods: {
    async deletePolicyItem() {
      deletePolicyItem.call(this, () =>
        this.$router.push(`/policies/${this.item.policy_id}`)
      )
    },
    perms(num) {
      return permsNumToLetter(num)
    },
    size(bytes) {
      if (!bytes) return ""
      return prettyBytes(bytes)
    },
  },
  async fetch() {
    const id = this.$route.params.id
    try {
      this.item = (await this.$axios.$get("/policy-items/" + id)).data
    } catch (e) {
      this.$nuxt.context.error({
        status: e.response.status,
        message:
          e.response.status === 404
            ? "Policy item could not be found"
            : e.response.statusText,
      })
      return
    }

    try {
      if (this.item.type === "file") {
        const newData = {
          ...this.item.data,
          ...(await this.$axios.$get("/files/" + this.item.data.file_id)).data,
        }

        this.item = {
          ...this.item,
          data: newData,
        }
      }
    } catch (e) {
      this.$nuxt.context.error({
        status: e.response.status,
        message:
          e.response.status === 404
            ? "File could not be found"
            : e.response.statusText,
      })
    }
  },
}
</script>
