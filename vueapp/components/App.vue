<template>
    <Page>
        <ActionBar :title="msg"/>

        <ScrollView>
            <StackLayout class="m-15">
                <!-- >> button-tap-event-html -->
                <Image src="vueapp/assets/images/NativeScript-Vue.png"></Image>

                <Button class="btn btn-primary btn-active" id="button" text="Tap me!" @tap="count++"/>
                <Label :text="`Tapped ${count} times`"/>
                <!-- << button-tap-event-html -->
            </StackLayout>
        </ScrollView>
    </Page>
</template>

<script>
  export default {
    data() {
      return {
        msg: 'Welcome to NativeScript-Vue!',
        count: 0
      };
    }
  }
</script>
