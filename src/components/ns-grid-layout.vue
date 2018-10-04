<template>
    <div>
        <slot></slot>
    </div>
</template>

<script>
    export default {
        name: 'ns-grid-layout',
        extends: import("./ns-element"),

        props: {
            msg: String
        }
    }
</script>
