<template>
  <section>
    <div class="flex">
      <div class="max-w-xs">
        <label for="wallet" class="block text-sm font-medium text-gray-700"
          >Тикер</label
        >
        <div class="mt-1 relative rounded-md shadow-md">
          <input
            v-model="ticker"
            @keydown.enter="add"
            type="text"
            name="wallet"
            id="wallet"
            class="block w-full pr-10 border-gray-300 text-gray-900 focus:outline-none focus:ring-gray-500 focus:border-gray-500 sm:text-sm rounded-md"
            placeholder="Например DOGE"
            autocomplete="off"
          />
        </div>
        <div class="prompts">
          <button
            class="prompt"
            v-for="prmpt in prompts"
            :key="prmpt"
            @click="usePrompt(prmpt)"
          >
            {{ prmpt }}
          </button>
        </div>
      </div>
    </div>
    <p v-if="isRepeatTicker" class="text-sm text-red-300">
      Такой тикер уже добавлен
    </p>
    <add-button @add-ticker="add" :disabled="disabled" />
    <!-- <div class="ddfg">{{ invalid }}</div> -->
  </section>
</template>
<script>
import AddButton from "./AddButton.vue";

export default {
  components: { AddButton },
  props: {
    tickers: {
      type: Array,
      required: false,
    },
    emits: {
      "add-ticker": (value) => typeof value === "string" && value.length > 0,
    },
    disabled: {
      type: Boolean,
      required: false,
      default: false,
    },
  },
  data() {
    return {
      ticker: "",
      tickerList: null,
    };
  },

  async created() {
    const dataTikerList = await fetch(
      "https://min-api.cryptocompare.com/data/all/coinlist?summary=true"
    ).then((res) => res.json());
    this.tickerList = Object.keys(dataTikerList.Data);
  },

  computed: {
    isRepeatTicker() {
      if (
        this.ticker.length &&
        this.tickers.find((t) => t.name === this.ticker)
      ) {
        return true;
      }
      return false;
    },
    prompts() {
      if (!this.ticker.length) {
        return [];
      }
      return this.tickerList
        .filter((ticker) => ticker.includes(this.ticker))
        .slice(0, 4);
    },
  },
  methods: {
    add() {
      if (
        this.isRepeatTicker ||
        this.ticker.length === 0 ||
        this.disabled === true
      ) {
        return;
      }

      this.$emit("add-ticker", this.ticker);
      this.ticker = "";
    },
    usePrompt(prompt) {
      this.ticker = prompt;
      this.add();
    },
  },
};
</script>
<style scoped>
.prompts {
  display: inline-flex;
}

.prompt {
  display: flex;
  background: rgb(197, 195, 195);
  font-size: 16px;
  margin-right: 10px;
  border-radius: 10px;
  font-weight: bold;
  padding-right: 5px;
  padding-left: 5px;
}
</style>
