<template>
    <div :style="styles">
        <slot></slot>
    </div>
</template>

<script>
    import { props, styles } from "../consts";

    export default {
        name: 'ns-template'
    }
</script>
