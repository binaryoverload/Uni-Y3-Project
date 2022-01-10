<template>
    <NuxtLink :to="to || '/'" v-slot="{ isActive, navigate, href }">
        <a :href="href" @click="navigate">
            <div
                :class="
                    commonStyles +
                    ' ' +
                    (isActive ? activeStyles : inactiveStyles)
                "
            >
                <span class="w-6 mr-4">
                    <font-awesome-icon
                        :icon="icon"
                        :class="active ? 'text-indigo-600 ' : ''"
                    /> </span
                ><slot />
            </div>
        </a>
    </NuxtLink>
</template>

<script>
export default {
    props: {
        to: String,
        icon: String,
    },
    data() {
        return {
            commonStyles: "w-full px-16 py-4 text-xl cursor-pointer",
            inactiveStyles: "text-slate-400 hover:text-slate-200",
            activeStyles:
                "text-white bg-indigo-400 hover:bg-opacity-20 bg-opacity-10",
        };
    },
};
</script>
