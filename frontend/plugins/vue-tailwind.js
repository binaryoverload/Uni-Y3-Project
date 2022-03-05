import Vue from "vue";
import VueTailwind from "vue-tailwind";

import {
  TInput,
  TTextarea,
  TSelect,
  TRadio,
  TCheckbox,
  TButton,
  TInputGroup,
  TCard,
  TAlert,
  TModal,
  TDropdown,
  TRichSelect,
  TPagination,
  TTag,
  TRadioGroup,
  TCheckboxGroup,
  TTable,
  TDatepicker,
  TToggle,
  TDialog,
} from "vue-tailwind/dist/components";

Vue.use(VueTailwind, {
  "t-input": {
    component: TInput,
  },
  "t-select": {
    component: TSelect,
  },
  "t-textarea": {
    component: TTextarea,
  },
  "t-radio": {
    component: TRadio,
  },
  "t-checkbox": {
    component: TCheckbox,
  },
  "t-button": {
    component: TButton,
    props: {
      fixedClasses:
        "block px-4 py-1 transition duration-100 ease-in-out  focus:ring-2  focus:outline-none focus:ring-opacity-50 disabled:opacity-50 disabled:cursor-not-allowed",
      classes:
        "text-white bg-indigo-700 border border-transparent shadow-sm rounded hover:bg-indigo-800 focus:ring-indigo-500 focus:border-indigo-500",
      variants: {
        error:
          "text-white bg-red-500 border border-transparent rounded shadow-sm hover:bg-red-600",
        success:
          "text-white bg-green-500 border border-transparent rounded shadow-sm hover:bg-green-600",
        link: "text-blue-500 underline hover:text-blue-600",
        neutral: "text-slate-600 bg-slate-200 rounded shadow-sm hover:bg-slate-300 focus:ring-slate-500 focus:border-slate-500",
        secondary:
          "text-gray-800 bg-white border border-gray-300 shadow-sm focus:ring-indigo-500 hover:text-gray-600",
      },
    },
  },
  "t-inputgroup": {
    component: TInputGroup,
  },
  "t-card": {
    component: TCard,
  },
  "t-alert": {
    component: TAlert,
    props: {
      fixedClasses: {
        wrapper: "relative flex items-center px-4 py-2 border-l-4  rounded shadow-sm",
        body: "flex-grow",
        close:
          "absolute relative flex items-center justify-center ml-4 flex-shrink-0 w-6 h-6 transition duration-100 ease-in-out rounded  focus:ring-2 focus:ring-blue-500 focus:outline-none focus:ring-opacity-50",
        closeIcon: "fill-current h-4 w-4",
      },
      classes: {
        wrapper: "bg-blue-50 border-blue-500",
        body: "text-blue-700",
        close: "text-blue-500 hover:bg-blue-200",
      },
      variants: {
        danger: {
          wrapper: "bg-red-50 border-red-500",
          body: "text-red-700",
          close: "text-red-500 hover:bg-red-200",
        },
        success: {
          wrapper: "bg-green-50 border-green-500",
          body: "text-green-700",
          close: "text-green-500 hover:bg-green-200",
        },
      },
    },
  },
  "t-modal": {
    component: TModal,
  },
  "t-dropdown": {
    component: TDropdown,
  },
  "t-rich-select": {
    component: TRichSelect,
    props: {
      fixedClasses: {
        wrapper: "relative",
        buttonWrapper: "inline-block relative w-full",
        selectButton:
          "w-full flex text-left justify-between items-center px-3 py-2 text-black transition duration-100 ease-in-out border rounded shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-none focus:ring-opacity-50 disabled:opacity-50 disabled:cursor-not-allowed",
        selectButtonLabel: "block truncate",
        selectButtonPlaceholder: "block truncate",
        selectButtonIcon: "fill-current flex-shrink-0 ml-1 h-4 w-4",
        selectButtonClearButton:
          "rounded flex flex-shrink-0 items-center justify-center absolute right-0 top-0 m-2 h-6 w-6 transition duration-100 ease-in-out",
        selectButtonClearIcon: "fill-current h-3 w-3",
        dropdown:
          "absolute w-full z-10 -mt-1 absolute border-b border-l border-r rounded-b shadow-sm z-10",
        dropdownFeedback: "",
        loadingMoreResults: "",
        optionsList: "overflow-auto",
        searchWrapper: "inline-block w-full",
        searchBox: "inline-block w-full",
        optgroup: "",
        option: "cursor-pointer",
        disabledOption: "opacity-50 cursor-not-allowed",
        highlightedOption: "cursor-pointer",
        selectedOption: "cursor-pointer",
        selectedHighlightedOption: "cursor-pointer",
        optionContent: "",
        optionLabel: "truncate block",
        selectedIcon: "fill-current h-4 w-4",
        enterClass: "",
        enterActiveClass: "",
        enterToClass: "",
        leaveClass: "",
        leaveActiveClass: "",
        leaveToClass: "",
      },
      classes: {
        wrapper: "",
        buttonWrapper: "",
        selectButton: "bg-white border-gray-300",
        selectButtonLabel: "",
        selectButtonPlaceholder: "text-gray-400",
        selectButtonIcon: "text-gray-600",
        selectButtonClearButton: "hover:bg-blue-100 text-gray-600",
        selectButtonClearIcon: "",
        dropdown: "bg-white border-gray-300",
        dropdownFeedback: "pb-2 px-3 text-gray-400 text-sm",
        loadingMoreResults: "pb-2 px-3 text-gray-400 text-sm",
        optionsList: "",
        searchWrapper: "p-2 placeholder-gray-400",
        searchBox:
          "px-3 py-2 bg-gray-50 text-sm rounded border focus:outline-none focus:shadow-outline border-gray-300",
        optgroup: "text-gray-400 uppercase text-xs py-1 px-2 font-semibold",
        option: "",
        disabledOption: "",
        highlightedOption: "bg-blue-100",
        selectedOption:
          "font-semibold bg-gray-100 bg-blue-500 font-semibold text-white",
        selectedHighlightedOption:
          "font-semibold bg-gray-100 bg-blue-600 font-semibold text-white",
        optionContent: "flex justify-between items-center px-3 py-2",
        optionLabel: "",
        selectedIcon: "",
        enterClass: "opacity-0",
        enterActiveClass: "transition ease-out duration-100",
        enterToClass: "opacity-100",
        leaveClass: "opacity-100",
        leaveActiveClass: "transition ease-in duration-75",
        leaveToClass: "opacity-0",
      },
      variants: {
        danger: {
          selectButton: "border-red-300 bg-red-50 text-red-900",
          selectButtonPlaceholder: "text-red-200",
          selectButtonIcon: "text-red-500",
          selectButtonClearButton: "hover:bg-red-200 text-red-500",
          dropdown: "bg-red-50 border-red-300",
        },
        success: {
          selectButton: "border-green-300 bg-green-50 text-green-900",
          selectButtonIcon: "text-green-500",
          selectButtonClearButton: "hover:bg-green-200 text-green-500",
          dropdown: "bg-green-50 border-green-300",
        },
      },
    },
  },
  "t-pagination": {
    component: TPagination,
  },
  "t-tag": {
    component: TTag,
  },
  "t-radiogroup": {
    component: TRadioGroup,
  },
  "t-checkboxgroup": {
    component: TCheckboxGroup,
  },
  "t-table": {
    component: TTable,
  },
  "t-datepicker": {
    component: TDatepicker,
  },
  "t-toggle": {
    component: TToggle,
  },
  "t-dialog": {
    component: TDialog,
  },
});
