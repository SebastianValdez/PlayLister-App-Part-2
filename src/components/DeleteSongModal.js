import React, { Component } from "react";

export default class DeleteSongModal extends Component {
  render() {
    const {
      listKeyPair,
      deleteSongCallback,
      hideDeleteSongModalCallback,
      songIndex,
    } = this.props;

    let name = "";
    if (listKeyPair) {
      name = listKeyPair.name;
    }

    return (
      <div class="modal" id="delete-song-modal" data-animation="slideInOutLeft">
        <div class="modal-root" id="verify-delete-song-root">
          <div class="modal-north">Remove song?</div>
          <div class="modal-center">
            <div class="modal-center-content">
              Are you sure you wish to permanently remove {name} from the
              playlist?
            </div>
          </div>
          <div class="modal-south">
            <input
              type="button"
              id="delete-song-confirm-button"
              class="modal-button"
              onClick={() => {
                console.log(songIndex);
                deleteSongCallback(songIndex);
              }}
              value="Confirm"
            />
            <input
              type="button"
              id="delete-song-cancel-button"
              class="modal-button"
              onClick={hideDeleteSongModalCallback}
              value="Cancel"
            />
          </div>
        </div>
      </div>
    );
  }
}
