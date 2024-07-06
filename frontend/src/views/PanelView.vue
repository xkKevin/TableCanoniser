<template>
  <div id="panel">
    <div class="system-name">TableTydier</div>

    <div class="main-views">
      <!-- Column 1 -->
      <div class="column left">
        <InOutTable />
      </div>

      <!-- Column 2 -->
      <div class="column center">
        <div class="view center1">
          <h2 class="view-title">Transformation Script</h2>
          <div class="view-content">
            <p>This is the content of Transformation Script.</p>
          </div>
        </div>
        <div class="view center2">
          <h2 class="view-title">Chat</h2>
          <div class="view-content">
            <hot-table ref="testTbl" :settings="hotSettings" licenseKey="non-commercial-and-evaluation"></hot-table>
          </div>
        </div>
      </div>

      <!-- Column 3 -->
      <div class="column right">
        <div class="view">
          <h2 class="view-title">Mapping Details</h2>
          <div class="view-content mapping-details">
            <div class="sub-view sub1">
              <h3 class="sub-view-title">Observation-based Mapping</h3>
              <p>This is the content of Observation-based Mapping.</p>
            </div>
            <div class="sub-view sub2">
              <h3 class="sub-view-title">Variable-based Mapping</h3>
              <p>This is the content of Variable-based Mapping .</p>
            </div>
            <div class="sub-view sub3">
              <h3 class="sub-view-title">Unused Area</h3>
              <p>This is the content of Unused Area.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { defineComponent, ref } from "vue";
import { HotTable } from "@handsontable/vue3";
import { registerAllModules } from "handsontable/registry";
import "handsontable/dist/handsontable.full.css";

import InOutTable from "@/components/InOutTable.vue";

import Data from "@/assets/data/case.json";

// register Handsontable's modules
registerAllModules();

export default defineComponent({
  data() {
    return {
      isOpen: false,
      currentCase: ref(""),
      caseOption: ref([]),
      caseData: ref({}),

      hotSettings: {
        data: [
          {
            brand: "Jetpulse",
            model: "Racing Socks",
            price: 30,
            sellDate: "Oct 11, 2023",
            sellTime: "01:23 AM",
            inStock: false,
          },
          {
            brand: "Gigabox",
            model: "HL Mountain Frame",
            price: 1890.9,
            sellDate: "May 3, 2023",
            sellTime: "11:27 AM",
            inStock: false,
          },
          {
            brand: "Camido",
            model: "Cycling Cap",
            price: 130.1,
            sellDate: "Mar 27, 2023",
            sellTime: "03:17 AM",
            inStock: true,
          },
          {
            brand: "Chatterpoint",
            model: "Road Tire Tube",
            price: 59,
            sellDate: "Aug 28, 2023",
            sellTime: "08:01 AM",
            inStock: true,
          },
          {
            brand: "Eidel",
            model: "HL Road Tire",
            price: 279.99,
            sellDate: "Oct 2, 2023",
            sellTime: "01:23 AM",
            inStock: true,
          },
        ],
        colHeaders: true,
        columns: [
          {
            title: "Brand",
            type: "text",
            data: "brand",
          },
          {
            title: "Model",
            type: "text",
            data: "model",
          },
          {
            title: "Price",
            type: "numeric",
            data: "price",
            numericFormat: {
              pattern: "$ 0,0.00",
              culture: "en-US",
            },
          },
          {
            title: "Date",
            // type: "date",
            data: "sellDate",
            // dateFormat: "MMM D, YYYY",
            correctFormat: false,
            className: "htRight",
          },
          {
            title: "Time",
            type: "time",
            data: "sellTime",
            timeFormat: "hh:mm A",
            correctFormat: true,
            className: "htRight",
          },
          {
            title: "In stock",
            type: "checkbox",
            data: "inStock",
            className: "htCenter",
          },
        ],
        rowHeaders: true,
        cell: [
          {
            row: 0,
            col: 0,
            className: "posi-mapping",
          },
        ],
      },
    };
  },
  components: {
    HotTable,
    InOutTable,
  },
  beforeMount() {
    this.caseOption = Object.keys(Data).map((v) => {
      return { value: v, label: v };
    });
    this.currentCase = this.caseOption[0].value;
    this.caseData = Data[this.currentCase];
    // console.log(this.caseData);
  },
  mounted() {
    const testHotInst = this.$refs.testTbl.hotInstance;
    // console.log(typeof testHotInst, this.$refs.testTbl);
    window.testHotInst = testHotInst;
    // console.log(this.$refs.Chat, this.$refs.inputTbl, this.$refs.outputTbl);
  },
  methods: {

  },
});
</script>

<style lang="less">
td.htRight {
  background-color: #3498db;
}

td.posi-mapping {
  color: #fff !important;
  background-color: #37bc6c;
}

td.ambiguous-cell {
  color: #e91010 !important;
  background-color: #83e4aa;
}

td.determined-cell {
  color: #e91010 !important;
  font-weight: bold;
  background-color: #37bc6c;
}

#panel {
  font-family: "Arial", sans-serif;
  display: flex;
  flex-direction: column;
  align-items: center;
  height: 100vh;
  margin: 0;
  padding: 0;
  background-color: #f0f0f0;
  /* Background color for the whole panel */
}

.system-name {
  font-size: 23px;
  font-weight: bold;
  width: calc(100vw - 50px);
  margin-top: 3px;
  //   margin: 20px 0;
  padding: 10px 16px;
  background-color: #3498db;
  /* System name background color */
  color: white;
  /* System name text color */
  //   border-radius: 8px;
}

.main-views {
  display: flex;
  justify-content: space-between;
  width: calc(100vw - 15px);
  padding: 1px;
  box-sizing: border-box;

  .left {
    flex: 6;

    .view {
      flex: 1;
    }
  }

  .center {
    flex: 6;

    .view {
      flex: 1;
    }
  }

  .right {
    flex: 3;

    .view {
      height: calc(100vh - 80px);
    }
  }
}

.column {
  display: flex;
  flex-direction: column;
}

.view {
  //   margin: 8px 2px 2px 8px;
  padding: 10px;
  border: 1px solid #ccc;
  //   border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  background-color: #ffffff;
  /* View background color */
}

.view-title {
  font-size: 18px;
  font-weight: bold;
  margin-bottom: 10px;
  color: #2c3e50;
  /* View title text color */
}

.view-content {
  overflow-y: auto;
  height: calc(100% - 40px);
}

.mapping-details {
  display: flex;
  flex-direction: column;
}

.sub-view {
  margin-bottom: 5px;
  flex: 1;
}

.sub-view-title {
  font-size: 16px;
  font-weight: bold;
  margin-bottom: 5px;
  color: #e67e22;
  /* Sub-view title text color */
}

#input-tbl {
  //   height: calc(100% - px);
  //   overflow: ceil(10);
}
</style>
