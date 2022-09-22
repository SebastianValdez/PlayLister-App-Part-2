import React, { Component } from "react";

export default class EditSongModal extends Component {
  render() {
    const {
      listKeyPair,
      editSongCallBack,
      hideEditSongModalCallback,
      songIndex,
    } = this.props;
    let name = "";
    if (listKeyPair) {
      name = listKeyPair.name;
    }

    return (
      <div class="modal" id="edit-song-modal" data-animation="slideInOutLeft">
        <div class="modal-root" id="verify-delete-list-root">
          <div class="modal-north">Edit Song</div>
          <div class="modal-center">
            <div class="modal-center-content">
              <label for="edit-modal-title-input">Title:</label>
              <input type="text" id="edit-modal-title-input" />

              <label for="edit-modal-artist-input">Artist:</label>
              <input type="text" id="edit-modal-artist-input" />

              <label for="edit-modal-id-input">YouTube ID:</label>
              <input type="text" id="edit-modal-id-input" />
            </div>
          </div>
          <div class="modal-south">
            <input
              type="button"
              id="edit-song-confirm-button"
              class="modal-button"
              value="Confirm"
              onClick={() => {
                let title = document.getElementById(
                  "edit-modal-title-input"
                ).value;
                let artist = document.getElementById(
                  "edit-modal-artist-input"
                ).value;
                let youTubeId = document.getElementById(
                  "edit-modal-id-input"
                ).value;

                editSongCallBack(songIndex, title, artist, youTubeId);
              }}
            />
            <input
              type="button"
              id="edit-song-cancel-button"
              class="modal-button"
              value="Cancel"
              onClick={hideEditSongModalCallback}
            />
          </div>
        </div>
      </div>
    );
  }
}
