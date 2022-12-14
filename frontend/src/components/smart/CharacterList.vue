<template>
  <div>
    <div class="filters row mt-2 pl-2" v-if="showFilters">
      <div class="col-2">
        <strong>Level</strong>
        <select class="form-control" v-model="levelFilter" @change="saveFilters()">
          <option v-for="x in ['', 1, 11, 21, 31, 41, 51, 61, 71, 81, 91]" :value="x" :key="x">
            {{ x ? `${x} - ${x + 9}` : 'Any' }}
          </option>
        </select>
      </div>

      <div class="col-2">
        <strong>Element</strong>
        <select class="form-control" v-model="elementFilter" @change="saveFilters()">
          <option v-for="x in ['', 'Earth', 'Fire', 'Lightning', 'Water']" :value="x" :key="x">{{ x || 'Any' }}</option>
        </select>
      </div>

      <div class="col-2" v-if="isMarket">
        <strong>Sort</strong>
        <select class="form-control" v-model="priceSort" @change="saveFilters()">
          <option v-for="x in ['', 'Price: Low -> High', 'Price: High -> Low']" :value="x" :key="x">{{ x || 'Any' }}</option>
        </select>
      </div>

      <b-button variant="primary" class="ml-3 clear-filters-button" @click="clearFilters" >
          <span>
            Clear Filters
          </span>
        </b-button>
    </div>

    <ul class="character-list">
      <li
        class="character"
        :class="{ selected: value === c.id }"
        v-for="c in filteredCharacters"
        :key="c.id"
        @click="$emit('input', c.id)"
      >
        <div class="above-wrapper" v-if="$slots.above || $scopedSlots.above">
          <slot name="above" :character="c"></slot>
        </div>
        <div class="art">
          <CharacterArt :character="c" />
        </div>
      </li>
    </ul>
  </div>
</template>

<script>
import { mapActions, mapGetters, mapState } from 'vuex';
import { getCharacterArt } from '../../character-arts-placeholder';
import CharacterArt from '../CharacterArt.vue';

export default {
  props: {
    value: {},
    showGivenCharacterIds: {
      type: Boolean,
      default: false
    },
    showFilters: {
      type: Boolean,
      default: false
    },
    characterIds: {
      type: Array,
      default() { return []; }
    },
    showLimit: {
      type: Number,
      default: 0
    },
    isMarket: {
      type: Boolean,
      default: false
    }
  },

  data() {
    return {
      levelFilter: '',
      elementFilter: '',
      priceSort: '',
    };
  },

  computed: {
    ...mapState(['maxStamina', 'ownedCharacterIds']),
    ...mapGetters(['getCharacterName', 'allStaminas', 'charactersWithIds']),

    characterIdsToDisplay() {
      if(this.showGivenCharacterIds) {
        return this.characterIds;
      }

      return this.ownedCharacterIds;
    },

    displayCharacters() {
      return this.charactersWithIds(this.characterIdsToDisplay).filter(Boolean);
    },

    filteredCharacters() {
      let items = this.displayCharacters;

      if(this.showFilters) {
        if(this.elementFilter) {
          items = items.filter(x => x.traitName.includes(this.elementFilter));
        }

        if(this.levelFilter) {
          items = items.filter(x => x.level >= this.levelFilter - 1 && x.level <= this.levelFilter + 8);
        }

        if(this.showLimit > 0 && items.length > this.showLimit) {
          items = items.slice(0, this.showLimit);
        }
      }

      return items;
    },

    priceSortAscText() {
      return 'Price: Low -> High';
    },

    priceSortDescText() {
      return 'Price: High -> Low';
    }
  },

  watch: {
    async characterIdsToDisplay(characterIds) {
      await this.fetchCharacters(characterIds);
    }
  },

  methods: {
    ...mapActions(['fetchCharacters']),

    getCharacterArt,

    getStaminaPoints(timestamp_str) {
      // super temporary function, just to make it work for now. sorry
      const timestamp = parseInt(timestamp_str, 10);
      const now = Date.now();
      if(timestamp  > now)
        return 0;

      let points = (now - timestamp) / 300;
      if(points > 200) {
        points = 200;
      }
      return points;
    },

    saveFilters() {
      sessionStorage.setItem('character-levelfilter', this.levelFilter);
      sessionStorage.setItem('character-elementfilter', this.elementFilter);

      if(this.isMarket) {
        const sortOrder = this.priceSort === this.priceSortAscText ? '1' :
          this.priceSort === this.priceSortDescText ? '-1' : '';
        sessionStorage.setItem('character-price-order', sortOrder);
      }
      this.$emit('character-filters-changed');
    },

    clearFilters() {
      sessionStorage.clear();

      this.elementFilter = '';
      this.levelFilter = '';
      this.priceSort = '';

      this.$emit('character-filters-changed');
    },
  },

  components: {
    CharacterArt,
  },

  mounted() {
    this.levelFilter = localStorage.getItem('character-levelfilter') || '';
    this.elementFilter = localStorage.getItem('character-elementfilter') || '';
    if(this.isMarket) {
      this.priceSort = sessionStorage.getItem('character-price-order') || '';
    }
  }
};
</script>

<style scoped>
.character-list {
  list-style-type: none;
  margin: 0;
  padding: 0;
  display: grid;
  padding: 0.5em;
  grid-template-columns: repeat(auto-fit, 14em);
  gap: 1.5em;
}

.character {
  position: relative;
  width: 14em;
  height: 25em;
  background-position: center;
  background-repeat: no-repeat;
  background-size: 115%;
  /* background-image: url('../../assets/cardCharacterFrame.png'); */
  background: url('../../assets/base/character.png') center no-repeat;
  background-size: cover !important;
  padding: 0.5rem;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  z-index: 1;
}

.character .art {
  width: 100%;
  min-height: 0;
  height: 18rem;
  background-position: center;
  background-repeat: no-repeat;
  background-size: contain;
}

.valign-middle {
  vertical-align: middle;
}

.character img {
  object-fit: contain;
}

.character.selected {
  /* box-shadow: 2px -1px 27px -5px rgba(225,184,71,0.74); */
  background: url('../../assets/base/character-hover.png') center no-repeat;
}

.above-wrapper {
  position: absolute;
  top: 270px;
  left: 0;
  right: 0;
  z-index: 100;
  text-shadow: 0 0 5px #333, 0 0 10px #333, 0 0 15px #333, 0 0 10px #333;
}

.clear-filters-button {
  align-self: flex-end;
  height: fit-content;
}

@media (max-width: 576px) {
  .character-list {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
  }
}
</style>
