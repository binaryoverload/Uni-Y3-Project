export function formMixin(name = "form") {
  const key = (n) => n + "_FORMDATA"
  return {
    data() {
      return {
        formData: {}
      }
    },
    created() {
      this.$set(this.formData, key(name), {
        loading: false,
      })
    },
    methods: {
      setFormLoading(bool, n = "form") {
        if (this.formData[key(n)])
          this.formData[key(n)].loading = bool
      },
      isFormLoading(n = "form") {
        return this.formData[key(n)]?.loading
      },
    },
  }
}
