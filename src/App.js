import React from "react";
import "./App.css";

// IMPORT DATA MANAGEMENT AND TRANSACTION STUFF
import DBManager from "./db/DBManager";
import jsTPS from "./common/jsTPS.js";

// OUR TRANSACTIONS
import MoveSong_Transaction from "./transactions/MoveSong_Transaction.js";
import AddSong_Transaction from "./transactions/AddSong_Transaction"; // ! Add
import EditSong_Transaction from "./transactions/EditSong_Transaction"; // ! Edit
import DeleteSongTransaction from "./transactions/DeleteSong_Transaction"; // ! Delete

// THESE REACT COMPONENTS ARE MODALS
import DeleteListModal from "./components/DeleteListModal.js";
import DeleteSongModal from "./components/DeleteSongModal.js";
import EditSongModal from "./components/EditSongModal.js";

// THESE REACT COMPONENTS ARE IN OUR UI
import Banner from "./components/Banner.js";
import EditToolbar from "./components/EditToolbar.js";
import PlaylistCards from "./components/PlaylistCards.js";
import SidebarHeading from "./components/SidebarHeading.js";
import SidebarList from "./components/SidebarList.js";
import Statusbar from "./components/Statusbar.js";

class App extends React.Component {
  constructor(props) {
    super(props);

    // THIS IS OUR TRANSACTION PROCESSING SYSTEM
    this.tps = new jsTPS(this);

    // THIS WILL TALK TO LOCAL STORAGE
    this.db = new DBManager();

    // GET THE SESSION DATA FROM OUR DATA MANAGER
    let loadedSessionData = this.db.queryGetSessionData();

    // SETUP THE INITIAL STATE
    this.state = {
      listKeyPairMarkedForDeletion: null,
      currentList: null,
      sessionData: loadedSessionData,
      songIndex: null, // ! Added for deleting and editing the song so we know the index
      songKeyPairMarkedForDeletion: null,
      modalIsOpen: false,
    };
  }
  sortKeyNamePairsByName = (keyNamePairs) => {
    keyNamePairs.sort((keyPair1, keyPair2) => {
      // GET THE LISTS
      return keyPair1.name.localeCompare(keyPair2.name);
    });
  };
  // THIS FUNCTION BEGINS THE PROCESS OF CREATING A NEW LIST
  createNewList = () => {
    // FIRST FIGURE OUT WHAT THE NEW LIST'S KEY AND NAME WILL BE
    let newKey = this.state.sessionData.nextKey;
    let newName = "Untitled" + newKey;

    // MAKE THE NEW LIST
    let newList = {
      key: newKey,
      name: newName,
      songs: [],
    };

    // MAKE THE KEY,NAME OBJECT SO WE CAN KEEP IT IN OUR
    // SESSION DATA SO IT WILL BE IN OUR LIST OF LISTS
    let newKeyNamePair = { key: newKey, name: newName };
    let updatedPairs = [...this.state.sessionData.keyNamePairs, newKeyNamePair];
    this.sortKeyNamePairsByName(updatedPairs);

    // CHANGE THE APP STATE SO THAT THE CURRENT LIST IS
    // THIS NEW LIST AND UPDATE THE SESSION DATA SO THAT THE
    // NEXT LIST CAN BE MADE AS WELL. NOTE, THIS setState WILL
    // FORCE A CALL TO render, BUT THIS UPDATE IS ASYNCHRONOUS,
    // SO ANY AFTER EFFECTS THAT NEED TO USE THIS UPDATED STATE
    // SHOULD BE DONE VIA ITS CALLBACK
    this.setState(
      (prevState) => ({
        listKeyPairMarkedForDeletion: prevState.listKeyPairMarkedForDeletion,
        currentList: newList,
        sessionData: {
          nextKey: prevState.sessionData.nextKey + 1,
          counter: prevState.sessionData.counter + 1,
          keyNamePairs: updatedPairs,
        },
      }),
      () => {
        // PUTTING THIS NEW LIST IN PERMANENT STORAGE
        // IS AN AFTER EFFECT
        this.db.mutationCreateList(newList);

        // SO IS STORING OUR SESSION DATA
        this.db.mutationUpdateSessionData(this.state.sessionData);

        // ! PART 7
        document.getElementById("add-song-button").disabled = false;
        document.getElementById("undo-button").disabled = true;
        document.getElementById("redo-button").disabled = true;
        document.getElementById("close-button").disabled = false;
        document.getElementById("add-list-button").disabled = true;
      }
    );
  };
  // THIS FUNCTION BEGINS THE PROCESS OF DELETING A LIST.
  deleteList = (key) => {
    // IF IT IS THE CURRENT LIST, CHANGE THAT
    let newCurrentList = null;
    if (this.state.currentList) {
      if (this.state.currentList.key !== key) {
        // THIS JUST MEANS IT'S NOT THE CURRENT LIST BEING
        // DELETED SO WE'LL KEEP THE CURRENT LIST AS IT IS
        newCurrentList = this.state.currentList;
      }
    }

    let keyIndex = this.state.sessionData.keyNamePairs.findIndex(
      (keyNamePair) => {
        return keyNamePair.key === key;
      }
    );
    let newKeyNamePairs = [...this.state.sessionData.keyNamePairs];
    if (keyIndex >= 0) newKeyNamePairs.splice(keyIndex, 1);

    // AND FROM OUR APP STATE
    this.setState(
      (prevState) => ({
        listKeyPairMarkedForDeletion: null,
        currentList: newCurrentList,
        sessionData: {
          nextKey: prevState.sessionData.nextKey,
          counter: prevState.sessionData.counter - 1,
          keyNamePairs: newKeyNamePairs,
        },
      }),
      () => {
        // DELETING THE LIST FROM PERMANENT STORAGE
        // IS AN AFTER EFFECT
        this.db.mutationDeleteList(key);

        // SO IS STORING OUR SESSION DATA
        this.db.mutationUpdateSessionData(this.state.sessionData);

        this.hideDeleteListModal();

        // ! PART 7 - IF WE DELETE THE LIST WE ARE CURRENTLY ON, DISABLE ALL THE SONG BUTTONS SINCE NO LIST IS OPEN
        if (!this.state.currentList) {
          document.getElementById("add-song-button").disabled = true;
          document.getElementById("undo-button").disabled = true;
          document.getElementById("redo-button").disabled = true;
          document.getElementById("close-button").disabled = true;
          document.getElementById("add-list-button").disabled = false;

          this.tps.clearAllTransactions();
        }
      }
    );
  };
  deleteMarkedList = () => {
    this.deleteList(this.state.listKeyPairMarkedForDeletion.key);
  };
  // THIS FUNCTION SPECIFICALLY DELETES THE CURRENT LIST
  deleteCurrentList = () => {
    if (this.state.currentList) {
      this.deleteList(this.state.currentList.key);
    }
  };
  renameList = (key, newName) => {
    let newKeyNamePairs = [...this.state.sessionData.keyNamePairs];
    // NOW GO THROUGH THE ARRAY AND FIND THE ONE TO RENAME
    for (let i = 0; i < newKeyNamePairs.length; i++) {
      let pair = newKeyNamePairs[i];
      if (pair.key === key) {
        pair.name = newName;
      }
    }
    this.sortKeyNamePairsByName(newKeyNamePairs);

    // WE MAY HAVE TO RENAME THE currentList
    let currentList = this.state.currentList;
    if (currentList.key === key) {
      currentList.name = newName;
    }

    this.setState(
      (prevState) => ({
        listKeyPairMarkedForDeletion: null,
        sessionData: {
          nextKey: prevState.sessionData.nextKey,
          counter: prevState.sessionData.counter,
          keyNamePairs: newKeyNamePairs,
        },
      }),
      () => {
        // AN AFTER EFFECT IS THAT WE NEED TO MAKE SURE
        // THE TRANSACTION STACK IS CLEARED
        let list = this.db.queryGetList(key);
        list.name = newName;
        this.db.mutationUpdateList(list);
        this.db.mutationUpdateSessionData(this.state.sessionData);
      }
    );
  };
  // THIS FUNCTION BEGINS THE PROCESS OF LOADING A LIST FOR EDITING
  loadList = (key) => {
    let newCurrentList = this.db.queryGetList(key);
    let oldCurrentList = this.state.currentList; // ! PART 7 - DONT CLEAR THE STACK IF WE DONT CHANGE LISTS
    this.setState(
      (prevState) => ({
        listKeyPairMarkedForDeletion: prevState.listKeyPairMarkedForDeletion,
        currentList: newCurrentList,
        sessionData: this.state.sessionData,
      }),
      () => {
        // AN AFTER EFFECT IS THAT WE NEED TO MAKE SURE
        // THE TRANSACTION STACK IS CLEARED
        if (oldCurrentList) {
          console.log("new ", key);
          console.log("old ", oldCurrentList.key);
        }
        if (oldCurrentList && oldCurrentList.key != key) {
          this.tps.clearAllTransactions();
          document.getElementById("undo-button").disabled = true;
          document.getElementById("redo-button").disabled = true;
        }

        // ! PART 7 - WHEN THE SITE FIRST LOADS, ALL THE SONG BUTTONS SHOULD BE DISABLED SINCE NO LIST SHOULD BE OPEN, ONLY ADD PLAYLIST IS ENABLED
        document.getElementById("add-song-button").disabled = false;
        document.getElementById("close-button").disabled = false;
        document.getElementById("add-list-button").disabled = true;
      }
    );
  };
  // THIS FUNCTION BEGINS THE PROCESS OF CLOSING THE CURRENT LIST
  closeCurrentList = () => {
    this.setState(
      (prevState) => ({
        listKeyPairMarkedForDeletion: prevState.listKeyPairMarkedForDeletion,
        currentList: null,
        sessionData: this.state.sessionData,
      }),
      () => {
        // AN AFTER EFFECT IS THAT WE NEED TO MAKE SURE
        // THE TRANSACTION STACK IS CLEARED
        this.tps.clearAllTransactions();

        // ! PART 7 - WHEN YOU CLOSE A LIST, ALL THE SONG BUTTONS SHOULD BE DISABLED SINCE NO LIST SHOULD BE OPEN, ONLY ADD PLAYLIST IS ENABLED
        document.getElementById("add-song-button").disabled = true;
        document.getElementById("undo-button").disabled = true;
        document.getElementById("redo-button").disabled = true;
        document.getElementById("close-button").disabled = true;
        document.getElementById("add-list-button").disabled = false;
      }
    );
  };
  setStateWithUpdatedList(list) {
    this.setState(
      (prevState) => ({
        listKeyPairMarkedForDeletion: prevState.listKeyPairMarkedForDeletion,
        currentList: list,
        sessionData: this.state.sessionData,
      }),
      () => {
        // UPDATING THE LIST IN PERMANENT STORAGE
        // IS AN AFTER EFFECT
        this.db.mutationUpdateList(this.state.currentList);
      }
    );
  }
  getPlaylistSize = () => {
    return this.state.currentList.songs.length;
  };
  // THIS FUNCTION MOVES A SONG IN THE CURRENT LIST FROM
  // start TO end AND ADJUSTS ALL OTHER ITEMS ACCORDINGLY
  moveSong(start, end) {
    let list = this.state.currentList;

    // WE NEED TO UPDATE THE STATE FOR THE APP
    start -= 1;
    end -= 1;
    if (start < end) {
      let temp = list.songs[start];
      for (let i = start; i < end; i++) {
        list.songs[i] = list.songs[i + 1];
      }
      list.songs[end] = temp;
    } else if (start > end) {
      let temp = list.songs[start];
      for (let i = start; i > end; i--) {
        list.songs[i] = list.songs[i - 1];
      }
      list.songs[end] = temp;
    }
    this.setStateWithUpdatedList(list);
  }
  // THIS FUNCTION ADDS A MoveSong_Transaction TO THE TRANSACTION STACK
  addMoveSongTransaction = (start, end) => {
    let transaction = new MoveSong_Transaction(this, start, end);
    this.tps.addTransaction(transaction);
  };
  // THIS FUNCTION BEGINS THE PROCESS OF PERFORMING AN UNDO
  undo = () => {
    if (this.tps.hasTransactionToUndo()) {
      this.tps.undoTransaction();

      // MAKE SURE THE LIST GETS PERMANENTLY UPDATED
      this.db.mutationUpdateList(this.state.currentList);
    }
  };
  // THIS FUNCTION BEGINS THE PROCESS OF PERFORMING A REDO
  redo = () => {
    if (this.tps.hasTransactionToRedo()) {
      this.tps.doTransaction();

      // MAKE SURE THE LIST GETS PERMANENTLY UPDATED
      this.db.mutationUpdateList(this.state.currentList);
    }
  };
  markListForDeletion = (keyPair) => {
    this.setState(
      (prevState) => ({
        currentList: prevState.currentList,
        listKeyPairMarkedForDeletion: keyPair,
        sessionData: prevState.sessionData,
      }),
      () => {
        // PROMPT THE USER
        this.showDeleteListModal();
      }
    );
  };
  // THIS FUNCTION SHOWS THE MODAL FOR PROMPTING THE USER
  // TO SEE IF THEY REALLY WANT TO DELETE THE LIST
  showDeleteListModal = () => {
    let modal = document.getElementById("delete-list-modal");
    modal.classList.add("is-visible");
    this.openModal();
  };
  // THIS FUNCTION IS FOR HIDING THE MODAL
  hideDeleteListModal = () => {
    let modal = document.getElementById("delete-list-modal");
    modal.classList.remove("is-visible");
    this.closeModal();
  };

  // ! Part 4 - METHOD TO ADD A NEW SONG TO THE CURRENT LIST
  addSongToCurrentList = () => {
    let song = {
      title: "Untitled",
      artist: "Unknown",
      youTubeId: "dQw4w9WgXcQ",
    };

    let list = this.state.currentList;
    list.songs[list.songs.length] = song;
    this.setStateWithUpdatedList(list);
  };

  // ! Part 3 - METHODS TO REMOVE A SONG FROM THE CURRENT LIST
  // ! Changes that state variable that determines which index of song we delete in the current list
  markIndexForSongDeletion = (songIndex) => {
    this.setState(
      (prevState) => ({
        currentList: prevState.currentList,
        listKeyPairMarkedForDeletion: prevState.listKeyPairMarkedForDeletion,
        sessionData: prevState.sessionData,
        songIndex: songIndex,
        songKeyPairMarkedForDeletion: {
          id: songIndex,
          value: this.state.currentList.songs[songIndex].title,
        },
      }),
      () => {
        // PROMPT THE USER
        console.log("Hi", this.state.songIndex);
        this.showDeleteSongModal();
      }
    );
  };

  deleteSong = (index) => {
    let list = this.state.currentList;
    let songs = list.songs;
    let newSongsList = [];
    let oldSong = list.songs[index];

    for (let i = 0; i < songs.length; i++) {
      if (i != index) {
        newSongsList.push(songs[i]);
      }
    }
    list.songs = newSongsList;
    this.setStateWithUpdatedList(list);
    this.hideDeleteSongModal();
    return oldSong;
  };

  showDeleteSongModal = () => {
    let modal = document.getElementById("delete-song-modal");
    modal.classList.add("is-visible");
    this.openModal();
  };

  hideDeleteSongModal = () => {
    let modal = document.getElementById("delete-song-modal");
    modal.classList.remove("is-visible");
    this.closeModal();
  };

  // ! Part 2 - METHODS TO EDIT A SONG FROM THE CURRENT LIST
  // ! Changes that state variable that determines which index of song we delete in the current list
  markIndexForSongEditing = (songIndex) => {
    this.setState(
      (prevState) => ({
        currentList: prevState.currentList,
        listKeyPairMarkedForDeletion: prevState.listKeyPairMarkedForDeletion,
        sessionData: prevState.sessionData,
        songIndex: songIndex,
      }),
      () => {
        // PROMPT THE USER
        console.log(this.state.songIndex);
        this.showEditSongModal(songIndex);
      }
    );
  };

  editSong = (songindex, songTitle, songArtist, songId) => {
    let list = this.state.currentList;
    list.songs[songindex].title = songTitle;
    list.songs[songindex].artist = songArtist;
    list.songs[songindex].youTubeId = songId;

    this.setStateWithUpdatedList(list);
    this.hideEditSongModal();
  };

  showEditSongModal = () => {
    let modal = document.getElementById("edit-song-modal");

    document.getElementById("edit-modal-title-input").value =
      this.state.currentList.songs[this.state.songIndex].title;
    document.getElementById("edit-modal-artist-input").value =
      this.state.currentList.songs[this.state.songIndex].artist;
    document.getElementById("edit-modal-id-input").value =
      this.state.currentList.songs[this.state.songIndex].youTubeId;

    modal.classList.add("is-visible");
    this.openModal();
  };

  hideEditSongModal = () => {
    let modal = document.getElementById("edit-song-modal");
    modal.classList.remove("is-visible");
    this.closeModal();
  };

  // ! PART 5 - ADDING IN UNDO AND REDO FUNCTIONALITY

  addSongTransaction = () => {
    let transaction = new AddSong_Transaction(this);
    this.tps.addTransaction(transaction);
  };

  editSongTransaction = (index, songTitle, songArtist, songId) => {
    let transaction = new EditSong_Transaction(
      this,
      index,
      this.state.currentList.songs[index].title,
      this.state.currentList.songs[index].artist,
      this.state.currentList.songs[index].youTubeId,
      songTitle,
      songArtist,
      songId
    );
    this.tps.addTransaction(transaction);
  };

  deleteSongTransaction = (index) => {
    let transaction = new DeleteSongTransaction(this, index);
    this.tps.addTransaction(transaction);
  };

  addOldSong = (index, song) => {
    let list = this.state.currentList;
    list.songs.splice(index, 0, song);
    this.setStateWithUpdatedList(list);
  };

  // ! PART 7 - THESE TWO METHODS WILL BE USED TO ENABLE AND DISABLE BUTTONS
  disableButton(id) {
    let button = document.getElementById(id);
    button.classList.add("disabled");
    button.disabled = true;
  }

  enableButton(id) {
    let button = document.getElementById(id);
    button.classList.remove("disabled");
    button.disabled = false;
  }

  openModal = () => {
    this.setState(
      () => ({
        modalIsOpen: true,
      }),
      () => {
        this.disableButton("add-list-button");
        this.disableButton("undo-button");
        this.disableButton("redo-button");
        this.disableButton("close-button");
        this.disableButton("add-song-button");
      }
    );
  };

  closeModal = () => {
    this.setState(
      () => ({
        modalIsOpen: false,
      }),
      () => {
        if (this.state.currentList === null) {
          this.enableButton("add-list-button");
        } else {
          this.disableButton("add-list-button");
        }

        this.tps.enableOrDisableUndoButton();
        this.tps.enableOrDisableRedoButton();

        if (this.state.currentList === null) {
          this.disableButton("close-button");
        } else {
          this.enableButton("close-button");
        }

        if (this.state.currentList === null) {
          this.disableButton("add-song-button");
        } else {
          this.enableButton("add-song-button");
        }
      }
    );
  };

  // ! PART 6 - ADDING UNDO AND REDO USING KEYBOARD INPUTS
  componentDidMount() {
    // ! PART 7 - WHEN THE SITE FIRST LOADS, ALL THE SONG BUTTONS SHOULD BE DISABLED SINCE NO LIST SHOULD BE OPEN, ONLY ADD PLAYLIST IS ENABLED
    document.getElementById("add-song-button").disabled = true;
    document.getElementById("undo-button").disabled = true;
    document.getElementById("redo-button").disabled = true;
    document.getElementById("close-button").disabled = true;

    document.addEventListener("keydown", (event) => {
      if (!this.state.modalIsOpen) {
        if (event.ctrlKey && (event.key === "z" || event.key === "Z")) {
          this.undo();
        } else if (event.ctrlKey && (event.key === "y" || event.key === "Y")) {
          this.redo();
        }
      }
    });
  }

  render() {
    let canAddSong = this.state.currentList !== null;
    let canUndo = this.tps.hasTransactionToUndo();
    let canRedo = this.tps.hasTransactionToRedo();
    let canClose = this.state.currentList !== null;
    return (
      <div id="root">
        <Banner />
        <SidebarHeading createNewListCallback={this.createNewList} />
        <SidebarList
          currentList={this.state.currentList}
          keyNamePairs={this.state.sessionData.keyNamePairs}
          deleteListCallback={this.markListForDeletion}
          loadListCallback={this.loadList}
          renameListCallback={this.renameList}
        />
        <EditToolbar
          canAddSong={canAddSong}
          canUndo={canUndo}
          canRedo={canRedo}
          canClose={canClose}
          undoCallback={this.undo}
          redoCallback={this.redo}
          closeCallback={this.closeCurrentList}
          addSongCallback={this.addSongTransaction} // ! Part 3 - ADD A SONG TO THE CURRENT LIST
        />
        <PlaylistCards
          currentList={this.state.currentList}
          moveSongCallback={this.addMoveSongTransaction}
          markIndexForSongDeletion={this.markIndexForSongDeletion} // ! DELETE
          markIndexForSongEditing={this.markIndexForSongEditing} // ! EDIT
        />
        <Statusbar currentList={this.state.currentList} />
        <DeleteListModal
          listKeyPair={this.state.listKeyPairMarkedForDeletion}
          hideDeleteListModalCallback={this.hideDeleteListModal}
          deleteListCallback={this.deleteMarkedList}
        />
        <DeleteSongModal
          hideDeleteSongModalCallback={this.hideDeleteSongModal}
          deleteSongCallback={this.deleteSongTransaction}
          songIndex={this.state.songIndex}
          songKeyPairMarkedForDeletion={this.state.songKeyPairMarkedForDeletion}
        />
        <EditSongModal
          hideEditSongModalCallback={this.hideEditSongModal}
          editSongCallBack={this.editSongTransaction}
          songIndex={this.state.songIndex}
        />
      </div>
    );
  }
}

export default App;
