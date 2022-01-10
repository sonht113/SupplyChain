import React, { Component } from "react";
import ItemManagerContract from "./contracts/ItemManager.json";
import ItemContract from "./contracts/Item.json";
import ListItem from "./components/ListItem";
import getWeb3 from "./getWeb3";
import Swal from "sweetalert2";
import "./App.css";

class App extends Component {
  state = {
    loaded: false,
    cost: 0,
    itemName: "My supplyChain_1",
    listItems: [],
  };

  componentDidMount = async () => {
    try {
      // Get network provider and web3 instance.
      this.web3 = await getWeb3();

      // Use web3 to get the user's accounts.
      this.accounts = await this.web3.eth.getAccounts();

      // Get the contract instance.
      this.networkId = await this.web3.eth.net.getId();

      this.itemManager = new this.web3.eth.Contract(
        ItemManagerContract.abi,
        ItemManagerContract.networks[this.networkId] &&
          ItemManagerContract.networks[this.networkId].address
      );

      this.item = new this.web3.eth.Contract(
        ItemContract.abi,
        ItemContract.networks[this.networkId] &&
          ItemContract.networks[this.networkId].address
      );
      this.setState({ loaded: true });
      this.setList();
    } catch (error) {
      // Catch any errors for any of the above operations.
      alert(
        `Failed to load web3, accounts, or contract. Check console for details.`
      );
      console.error(error);
    }
  };

  // Set list item after change state (create -> paid -> deliver)
  setList = async () => {
    let indexItem = await this.itemManager.methods.getItemIndex().call();
    let newListItem = [];

    for (let i = 0; i < indexItem; i++) {
      let itemObject = await this.itemManager.methods.items(i).call();

      let item = new this.web3.eth.Contract(
        ItemContract.abi,
        itemObject._itemAddress
      );

      // Lay address owner tai item vi tri i o tren
      let addressOwner = await item.methods.addressOwner().call();

      const newItem = new Item(
        i,
        itemObject._identifier,
        itemObject._itemPrice,
        itemObject._state,
        itemObject._itemAddress,
        addressOwner
      );

      newListItem.push(newItem);
    }

    this.setState({
      listItems: newListItem,
    });
  };

  listenToPaymentEvent = () => {
    let self = this;
    this.itemManager.events.SupplyChainStep().on("data", async function (evt) {
      // console.log(evt);
      let itemObject = await self.itemManager.methods
        .items(evt.returnValues._itemIndex)
        .call();
      alert("Item " + itemObject._identifier + "was paid, deliver it now");
    });
  };

  handleInputChange = (event) => {
    const target = event.target;
    const value = target.type === "checkbox" ? target.checked : target.value;
    const name = target.name;

    this.setState({
      [name]: value,
    });
  };

  handleSubmit = async () => {
    try {
      const { cost, itemName } = this.state;
      let result = await this.itemManager.methods
        .createItem(itemName, cost, this.accounts[0])
        .send({ from: this.accounts[0] });

      console.log(result.events.SupplyChainStep.returnValues._itemAddress);
      const itemIndex = result.events.SupplyChainStep.returnValues._itemIndex;
      const step = result.events.SupplyChainStep.returnValues._step;
      const address = result.events.SupplyChainStep.returnValues._itemAddress;

      const newItem = new Item(
        itemIndex,
        itemName,
        cost,
        step,
        address,
        this.accounts[0]
      );

      this.setState((prevState) => ({
        listItems: [...prevState.listItems, newItem],
      }));
      alert(
        "Send " +
          cost +
          " Wei to " +
          result.events.SupplyChainStep.returnValues._itemAddress
      );
    } catch (err) {
      alert(err.message);
    }
  };

  handleClickPaid = async (item) => {
    let result = await this.itemManager.methods
      .triggerPayment(item.index)
      .send({
        to: item.addressItem,
        value: item.price,
        from: this.accounts[0],
      });
    console.log(result);
    this.setList();
    //alert("Paided item: " + item.addressItem);
    const swalWithBootstrapButtons = Swal.mixin({
      customClass: {
        confirmButton: "btn btn-success",
      },
      buttonsStyling: false,
    });

    swalWithBootstrapButtons
      .fire({
        title: "Paided item: " + item.addressItem,
        icon: "warning",
        showCancelButton: false,
        confirmButtonText: "Paid",
        reverseButtons: true,
      })
      .then((result) => {
        if (result.isConfirmed) {
          swalWithBootstrapButtons.fire(
            "Paided!",
            "Your item has been paided.",
            "success"
          );
        }
      });
  };

  handleClickDelivered = async (item) => {
    try {
      let result = await this.itemManager.methods
        .triggerDelivery(item.index)
        .send({ from: this.accounts[0] });
      console.log(result);
      this.setList();
      // alert("Delivered item: " + item.addressItem);
      const swalWithBootstrapButtons = Swal.mixin({
        customClass: {
          confirmButton: "btn btn-success",
        },
        buttonsStyling: false,
      });

      swalWithBootstrapButtons
        .fire({
          title: "Delivered item: " + item.addressItem,
          icon: "warning",
          showCancelButton: false,
          confirmButtonText: "Deliver",
          reverseButtons: true,
        })
        .then((result) => {
          if (result.isConfirmed) {
            swalWithBootstrapButtons.fire(
              "Delivered!",
              "Your item has been delivered.",
              "success"
            );
          }
        });
    } catch (e) {
      alert("Delivered failed ");
    }
  };

  render() {
    if (!this.state.loaded) {
      return <div>Loading Web3, accounts, and contract...</div>;
    }
    return (
      <div>
        <div id="create">
          <h1 className="text-center text-success">Supply Chain Group 12</h1>
          <h2 className="text-center">Add Items</h2>

          <div id="container" className="form-group">
            <div id="cost" className="form-control">
              <label className="title" htmlFor="cost">
                Cost in Wei:
              </label>
              <input
                type="number"
                name="cost"
                value={this.state.cost}
                onChange={this.handleInputChange}
              />
            </div>
            <div id="itemName" className="form-control">
              <label className="title" htmlFor="itemName">
                Name Item:
              </label>
              <input
                type="text"
                name="itemName"
                value={this.state.itemName}
                onChange={this.handleInputChange}
              />
            </div>
            <button
              className="btn btn-success"
              type="button"
              onClick={this.handleSubmit}
            >
              Create new Item
            </button>
          </div>
        </div>
        <ListItem
          listItems={this.state.listItems}
          itemManager={this.itemManager}
          handleClickPaid={this.handleClickPaid}
          handleClickDelivered={this.handleClickDelivered}
        ></ListItem>
      </div>
    );
  }
}

function Item(index, identifier, price, step, addressItem, ownerAddress) {
  this.index = index;
  this.identifier = identifier;
  this.price = price;
  this.step = step;
  this.addressItem = addressItem;
  this.ownerAddress = ownerAddress;
}

export default App;
