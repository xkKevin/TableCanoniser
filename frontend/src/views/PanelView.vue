<template>
  <div id="app">
    <div class="system-name">TableTydier</div>

    <div class="main-views">
      <!-- Column 1 -->
      <div class="column left">
        <div class="view left1">
          <h2 class="view-title">Input Table</h2>
          <div class="view-content">
            <!-- <p>This is the content of Input Table.</p> -->
            <div id="input-tbl">
              <hot-table
                ref="inputTbl"
                :data="input_tbl"
                :rowHeaders="true"
                :colHeaders="true"
                licenseKey="non-commercial-and-evaluation"
              ></hot-table>
            </div>
          </div>
        </div>

        <div class="view left2">
          <h2 class="view-title">Transformation Script</h2>
          <div class="view-content">
            <p>This is the content of Transformation Script.</p>
          </div>
        </div>
      </div>

      <!-- Column 2 -->
      <div class="column center">
        <div class="view center1">
          <h2 class="view-title">Output Table</h2>
          <div class="view-content">
            <div id="output-tbl">
              <hot-table
                ref="outputTbl"
                :data="output_tbl"
                :rowHeaders="true"
                :colHeaders="output_col"
                licenseKey="non-commercial-and-evaluation"
              ></hot-table>
            </div>
          </div>
        </div>

        <div class="view center2">
          <h2 class="view-title">Chat</h2>
          <div class="view-content">
            <hot-table
              ref="testTbl"
              :settings="hotSettings"
              licenseKey="non-commercial-and-evaluation"
            ></hot-table>
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
import { defineComponent } from "vue";
import { HotTable } from "@handsontable/vue3";
import { registerAllModules } from "handsontable/registry";
import "handsontable/dist/handsontable.full.css";

// register Handsontable's modules
registerAllModules();

export default defineComponent({
  data() {
    return {
      input_tbl: [
        ["OnePlus 2", "$330", "", "", "", "", ""],
        ["Release Date", "Aug 2015", "", "", "", "", ""],
        [
          "Dimensions",
          "Height",
          "151.8 mm",
          "Width",
          "74.9 mm",
          "Depth",
          "9.85 mm",
        ],
        ["Weight", "175 g", "", "", "", "", ""],
        ["Camera", "5", "13", "", "", "", ""],
        ["Battery", "3300 mAh LiPO", "", "", "", "", ""],
        ["", "", "", "", "", "", ""],
        ["Motorola X PURE", "$400", "", "", "", "", ""],
        ["Release Date", "Sept 2015", "", "", "", "", ""],
        [
          "Dimensions",
          "Width",
          "76.2 mm",
          "Height",
          "153.9 mm",
          "Depth",
          "6.1 to 11.06 mm",
        ],
        ["Weight", "179 g", "", "", "", "", ""],
        ["Camera", "5", "21", "", "", "", ""],
        ["Battery", "3000 mAh", "", "", "", "", ""],
        ["", "", "", "", "", "", ""],
        ["Samsung Galaxy S6", "$580", "", "", "", "", ""],
        ["Announced Date", "2015 Apr", "", "", "", "", ""],
        ["Dimensions", "H", "143.4 mm", "W", "70.5 mm", "D", "6.8 mm"],
        ["Weight", "138 g", "", "", "", "", ""],
        ["Camera", "16", "5", "", "", "", ""],
        ["Battery", "2550 mAh", "", "", "", "", ""],
        ["", "", "", "", "", "", ""],
        ["Samsung Galaxy Note 5", "$720", "", "", "", "", ""],
        ["Announced Date", "2015 Aug", "", "", "", "", ""],
        ["Dimensions", "W", "76.1 mm", "H", "153.2 mm", "D", "7.6 mm"],
        ["Weight", "171 g", "", "", "", "", ""],
        ["Camera", "16", "5", "", "", "", ""],
        ["Battery", "3000 mAh LiPO", "", "", "", "", ""],
        ["", "", "", "", "", "", ""],
        ["Apple iPhone 6s", "$650", "", "", "", "", ""],
        ["Release Date", "Sept 2015", "", "", "", "", ""],
        [
          "Dimensions",
          "Height",
          "138.3 mm",
          "Width",
          "67.1 mm",
          "Depth",
          "7.1 mm",
        ],
        ["Weight", "143 g", "", "", "", "", ""],
        ["Camera", "5", "12", "", "", "", ""],
        ["Battery", "1715 mAh LiPO", "", "", "", "", ""],
      ],
      output_col: [
        "Phone",
        "Price",
        "Release Date",
        "Height",
        "Width",
        "Depth",
        "Weight",
        "Front Camera",
        "Rear Camera",
        "Battery",
      ],
      output_tbl: [
        [
          "OnePlus 2",
          "$330",
          "Aug 2015",
          "151.8 mm",
          "74.9 mm",
          "9.85 mm",
          "175 g",
          "5",
          "13",
          "3300 mAh LiPO",
        ],
        [
          "Motorola X PURE",
          "$400",
          "Sept 2015",
          "153.9 mm",
          "76.2 mm",
          "6.1 to 11.06 mm",
          "179 g",
          "5",
          "21",
          "3000 mAh",
        ],
        [
          "Samsung Galaxy S6",
          "$580",
          "2015 Apr",
          "143.4 mm",
          "70.5 mm",
          "6.8 mm",
          "138 g",
          "5",
          "16",
          "2550 mAh",
        ],
        [
          "Samsung Galaxy Note 5",
          "$720",
          "2015 Aug",
          "153.2 mm",
          "76.1 mm",
          "7.6 mm",
          "171 g",
          "5",
          "16",
          "3000 mAh LiPO",
        ],
        [
          "Apple iPhone 6s",
          "$650",
          "Sept 2015",
          "138.3 mm",
          "67.1 mm",
          "7.1 mm",
          "143 g",
          "5",
          "12",
          "1715 mAh LiPO",
        ],
      ],
      in2out: {
        "[0,0]": ["[0,0]"],
        "[0,1]": ["[0,1]"],
        "[1,1]": ["[0,2]"],
        "[2,2]": ["[0,3]"],
        "[2,4]": ["[0,4]"],
        "[2,6]": ["[0,5]"],
        "[3,1]": ["[0,6]"],
        "[4,1]": ["[0,7]"],
        "[4,2]": ["[0,8]"],
        "[5,1]": ["[0,9]"],
        "[7,0]": ["[1,0]"],
        "[7,1]": ["[1,1]"],
        "[8,1]": ["[1,2]"],
        "[9,4]": ["[1,3]"],
        "[9,2]": ["[1,4]"],
        "[9,6]": ["[1,5]"],
        "[10,1]": ["[1,6]"],
        "[11,1]": ["[1,7]"],
        "[11,2]": ["[1,8]"],
        "[12,1]": ["[1,9]"],
        "[14,0]": ["[2,0]"],
        "[14,1]": ["[2,1]"],
        "[15,1]": ["[2,2]"],
        "[16,2]": ["[2,3]"],
        "[16,4]": ["[2,4]"],
        "[16,6]": ["[2,5]"],
        "[17,1]": ["[2,6]"],
        "[18,2]": ["[2,7]"],
        "[18,1]": ["[2,8]"],
        "[19,1]": ["[2,9]"],
        "[21,0]": ["[3,0]"],
        "[21,1]": ["[3,1]"],
        "[22,1]": ["[3,2]"],
        "[23,4]": ["[3,3]"],
        "[23,2]": ["[3,4]"],
        "[23,6]": ["[3,5]"],
        "[24,1]": ["[3,6]"],
        "[25,2]": ["[3,7]"],
        "[25,1]": ["[3,8]"],
        "[26,1]": ["[3,9]"],
        "[28,0]": ["[4,0]"],
        "[28,1]": ["[4,1]"],
        "[29,1]": ["[4,2]"],
        "[30,2]": ["[4,3]"],
        "[30,4]": ["[4,4]"],
        "[30,6]": ["[4,5]"],
        "[31,1]": ["[4,6]"],
        "[32,1]": ["[4,7]"],
        "[32,2]": ["[4,8]"],
        "[33,1]": ["[4,9]"],
      },
      out2in: {
        cells: {
          "[0,0]": "[0,0]",
          "[0,1]": "[0,1]",
          "[0,2]": "[1,1]",
          "[0,3]": "[2,2]",
          "[0,4]": "[2,4]",
          "[0,5]": "[2,6]",
          "[0,6]": "[3,1]",
          "[0,7]": "[4,1]",
          "[0,8]": "[4,2]",
          "[0,9]": "[5,1]",
          "[1,0]": "[7,0]",
          "[1,1]": "[7,1]",
          "[1,2]": "[8,1]",
          "[1,3]": "[9,4]",
          "[1,4]": "[9,2]",
          "[1,5]": "[9,6]",
          "[1,6]": "[10,1]",
          "[1,7]": "[11,1]",
          "[1,8]": "[11,2]",
          "[1,9]": "[12,1]",
          "[2,0]": "[14,0]",
          "[2,1]": "[14,1]",
          "[2,2]": "[15,1]",
          "[2,3]": "[16,2]",
          "[2,4]": "[16,4]",
          "[2,5]": "[16,6]",
          "[2,6]": "[17,1]",
          "[2,7]": "[18,2]",
          "[2,8]": "[18,1]",
          "[2,9]": "[19,1]",
          "[3,0]": "[21,0]",
          "[3,1]": "[21,1]",
          "[3,2]": "[22,1]",
          "[3,3]": "[23,4]",
          "[3,4]": "[23,2]",
          "[3,5]": "[23,6]",
          "[3,6]": "[24,1]",
          "[3,7]": "[25,2]",
          "[3,8]": "[25,1]",
          "[3,9]": "[26,1]",
          "[4,0]": "[28,0]",
          "[4,1]": "[28,1]",
          "[4,2]": "[29,1]",
          "[4,3]": "[30,2]",
          "[4,4]": "[30,4]",
          "[4,5]": "[30,6]",
          "[4,6]": "[31,1]",
          "[4,7]": "[32,1]",
          "[4,8]": "[32,2]",
          "[4,9]": "[33,1]",
        },
        cols: [
          ["[0,0]", "[7,0]", "[14,0]", "[21,0]", "[28,0]"],
          ["[0,1]", "[7,1]", "[14,1]", "[21,1]", "[28,1]"],
          ["[1,1]", "[8,1]", "[15,1]", "[22,1]", "[29,1]"],
          ["[2,2]", "[9,4]", "[16,2]", "[23,4]", "[30,2]"],
          ["[2,4]", "[9,2]", "[16,4]", "[23,2]", "[30,4]"],
          ["[2,6]", "[9,6]", "[16,6]", "[23,6]", "[30,6]"],
          ["[3,1]", "[10,1]", "[17,1]", "[24,1]", "[31,1]"],
          ["[4,1]", "[11,1]", "[18,2]", "[25,2]", "[32,1]"],
          ["[4,2]", "[11,2]", "[18,1]", "[25,1]", "[32,2]"],
          ["[5,1]", "[12,1]", "[19,1]", "[26,1]", "[33,1]"],
        ],
        rows: [
          [
            "[0,0]",
            "[0,1]",
            "[1,1]",
            "[2,2]",
            "[2,4]",
            "[2,6]",
            "[3,1]",
            "[4,1]",
            "[4,2]",
            "[5,1]",
          ],
          [
            "[7,0]",
            "[7,1]",
            "[8,1]",
            "[9,4]",
            "[9,2]",
            "[9,6]",
            "[10,1]",
            "[11,1]",
            "[11,2]",
            "[12,1]",
          ],
          [
            "[14,0]",
            "[14,1]",
            "[15,1]",
            "[16,2]",
            "[16,4]",
            "[16,6]",
            "[17,1]",
            "[18,2]",
            "[18,1]",
            "[19,1]",
          ],
          [
            "[21,0]",
            "[21,1]",
            "[22,1]",
            "[23,4]",
            "[23,2]",
            "[23,6]",
            "[24,1]",
            "[25,2]",
            "[25,1]",
            "[26,1]",
          ],
          [
            "[28,0]",
            "[28,1]",
            "[29,1]",
            "[30,2]",
            "[30,4]",
            "[30,6]",
            "[31,1]",
            "[32,1]",
            "[32,2]",
            "[33,1]",
          ],
        ],
      },
      ambiguous_posi: {
        "[0,7]": [
          [4, 1],
          [11, 1],
          [18, 2],
          [25, 2],
          [32, 1],
        ],
        "[1,2]": [
          [8, 1],
          [29, 1],
        ],
        "[1,7]": [
          [4, 1],
          [11, 1],
          [18, 2],
          [25, 2],
          [32, 1],
        ],
        "[2,7]": [
          [4, 1],
          [11, 1],
          [18, 2],
          [25, 2],
          [32, 1],
        ],
        "[2,8]": [
          [18, 1],
          [25, 1],
        ],
        "[3,7]": [
          [4, 1],
          [11, 1],
          [18, 2],
          [25, 2],
          [32, 1],
        ],
        "[3,8]": [
          [18, 1],
          [25, 1],
        ],
        "[4,2]": [
          [8, 1],
          [29, 1],
        ],
        "[4,7]": [
          [4, 1],
          [11, 1],
          [18, 2],
          [25, 2],
          [32, 1],
        ],
      },
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
  },
  mounted() {
    const inHotInst = this.$refs.inputTbl.hotInstance;
    const outHotInst = this.$refs.outputTbl.hotInstance;
    const testHotInst = this.$refs.testTbl.hotInstance;
    window.inHotInst = inHotInst;
    window.testHotInst = testHotInst;
    outHotInst.updateSettings({
      outsideClickDeselects: (event) => {
        inHotInst.updateSettings({ cell: [] });
        return true;
      },
    });
    outHotInst.addHook("afterOnCellMouseUp", (event, coords, TD) => {
      let cell = [];
      //   console.log(coords);
      let cell_posi = [];
      if (coords.row < 0) {
        if (this.out2in.cols[coords.col]) {
          this.out2in.cols[coords.col].forEach((posi) => {
            posi = JSON.parse(posi);
            cell.push({
              row: posi[0],
              col: posi[1],
              className: "posi-mapping",
            });
            cell_posi.push(posi);
          });
        }
      } else if (coords.col < 0) {
        this.out2in.rows[coords.row].forEach((posi) => {
          posi = JSON.parse(posi);
          cell.push({ row: posi[0], col: posi[1], className: "posi-mapping" });
          cell_posi.push(posi);
        });
      } else {
        let output_posi = `[${coords.row},${coords.col}]`;
        let posi = this.out2in.cells[output_posi];
        if (posi) {
          if (output_posi in this.ambiguous_posi) {
            this.ambiguous_posi[output_posi].forEach((in_posi) => {
              cell.push({
                row: in_posi[0],
                col: in_posi[1],
                className: "ambiguous-cell",
              });
            });
            posi = JSON.parse(posi);
            cell.push({
              row: posi[0],
              col: posi[1],
              className: "determined-cell",
            });
          } else {
            posi = JSON.parse(posi);
            cell.push({
              row: posi[0],
              col: posi[1],
              className: "posi-mapping",
            });
          }
          cell_posi.push(posi);
        }
      }
      inHotInst.updateSettings({ cell });
      let start_point = this.startPoint(cell_posi);
      inHotInst.scrollViewportTo({
        row: start_point[0],
        col: start_point[1],
        verticalSnap: "top",
        horizontalSnap: "start",
      });
    });

    inHotInst.updateSettings({
      outsideClickDeselects: (event) => {
        outHotInst.updateSettings({ cell: [] });
        return true;
      },
    });
    inHotInst.addHook("afterOnCellMouseUp", (event, coords, TD) => {
      let cell = [];
      let posi = this.in2out[`[${coords.row},${coords.col}]`];
      if (posi) {
        posi = JSON.parse(posi);
        cell.push({ row: posi[0], col: posi[1], className: "posi-mapping" });
        outHotInst.scrollViewportTo({
          row: posi[0],
          col: posi[1],
          verticalSnap: "top",
          horizontalSnap: "start",
        });
      }
      outHotInst.updateSettings({ cell });
    });
  },
  methods: {
    startPoint(points) {
      if (points.length === 0) {
        throw new Error("Coordinate array is empty");
      }

      let topLeft = points[0];

      for (let i = 1; i < points.length; i++) {
        let current = points[i];
        if (
          current[0] < topLeft[0] ||
          (current[0] === topLeft[0] && current[1] < topLeft[1])
        ) {
          topLeft = current;
        }
      }

      return topLeft;
    },
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

#app {
  font-family: "Arial", sans-serif;
  display: flex;
  flex-direction: column;
  align-items: center;
  height: 100vh;
  margin: 0;
  padding: 0;
  background-color: #f0f0f0; /* Background color for the whole app */
}

.system-name {
  font-size: 23px;
  font-weight: bold;
  width: calc(100vw - 50px);
  margin-top: 3px;
  //   margin: 20px 0;
  padding: 10px 16px;
  background-color: #3498db; /* System name background color */
  color: white; /* System name text color */
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
  background-color: #ffffff; /* View background color */
}

.view-title {
  font-size: 18px;
  font-weight: bold;
  margin-bottom: 10px;
  color: #2c3e50; /* View title text color */
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
  color: #e67e22; /* Sub-view title text color */
}

#input-tbl {
  //   height: calc(100% - px);
  //   overflow: ceil(10);
}
</style>
