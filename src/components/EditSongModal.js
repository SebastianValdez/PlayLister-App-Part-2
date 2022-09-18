import React, { Component } from "react";

export default class EditSongModal extends Component {
  render() {
    const { listKeyPair, editSongCallback, hideEditSongModalCallback } =
      this.props;
    let name = "";
    if (listKeyPair) {
      name = listKeyPair.name;
    }

    return (
      <div class="modal" id="delete-list-modal" data-animation="slideInOutLeft">
        <div class="modal-root" id="verify-delete-list-root">
          <div class="modal-north">Delete playlist?</div>
          <div class="modal-center">
            <div class="modal-center-content">
              Are you sure you wish to permanently delete the {name} playlist?
            </div>
          </div>
          <div class="modal-south">
            <input
              type="text"
              id="delete-list-confirm-button"
              class="modal-button"
              // onClick={}
              value="Confirm"
            />

            <input
              type="text"
              id="delete-list-cancel-button"
              class="modal-button"
              // onClick={}
              value="Cancel"
            />

            <input
              type="text"
              id="delete-list-cancel-button"
              class="modal-button"
              onClick={hideEditSongModalCallback}
              value="Cancel"
            />
          </div>
        </div>
      </div>
    );
  }
}
