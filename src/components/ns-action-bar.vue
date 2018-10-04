<template>
    <div>
        <span :text="currentTitle"></span>
        <slot></slot>
    </div>
</template>

<script>
    export default {
        name: 'ns-action-bar',
        extends: import("./ns-element"),

        props: ["title"],

        computed: {
            currentTitle() {
                return this.title;
            }
        }
    }
</script>
