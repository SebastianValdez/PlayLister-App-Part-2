import jsTPS_Transaction from "../common/jsTPS.js";

export default class AddSong_Transaction extends jsTPS_Transaction {
  constructor(initApp) {
    super();
    this.app = initApp;
  }

  doTransaction() {
    this.app.addSongToCurrentList();
  }

  undoTransaction() {
    this.app.deleteSong(this.app.state.currentList.songs.length - 1);
  }
}
