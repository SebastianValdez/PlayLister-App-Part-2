import jsTPS_Transaction from "../common/jsTPS.js";

export default class EditSong_Transaction extends jsTPS_Transaction {
  constructor(
    initApp,
    index,
    oldSongTitle,
    oldSongArtist,
    oldSongId,
    songTitle,
    songArtist,
    songId
  ) {
    super();
    this.app = initApp;
    this.index = index;
    this.oldSongTitle = oldSongTitle;
    this.oldSongArtist = oldSongArtist;
    this.oldSongId = oldSongId;
    this.songTitle = songTitle;
    this.songArtist = songArtist;
    this.songId = songId;
  }

  doTransaction() {
    this.app.editSong(this.index, this.songTitle, this.songArtist, this.songId);
  }

  undoTransaction() {
    this.app.editSong(
      this.index,
      this.oldSongTitle,
      this.oldSongArtist,
      this.oldSongId
    );
  }
}
