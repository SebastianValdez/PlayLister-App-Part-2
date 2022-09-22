import jsTPS_Transaction from "../common/jsTPS.js";

export default class DeleteSong_Transaction extends jsTPS_Transaction {
  constructor(initApp, index) {
    super();
    this.app = initApp;
    this.index = index;
    this.song = {};
  }

  doTransaction() {
    this.song = this.app.deleteSong(this.index);
    console.log(this.song);
  }

  undoTransaction() {
    this.app.addOldSong(this.index, this.song);
  }
}
