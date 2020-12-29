import React, { Component } from "react";
import RecordContract from "./contracts/Record.json";
import getWeb3 from "./getWeb3";

import "./App.css";


class App extends Component {
  state = { storageValue: 0, 
    web3: null,
    allProposals:[],
    accounts: null, 
    contract: null, 
    currentProposal: [], 
    network: null,
    name: '',
    tokenName: '',
    startPrice: 0,
    estimatedPrice: 0,
    desc: '',
  };
  nameMapping = {"0x25D716f9b27c07E9A34FaBd4BB1485AB173e4047":"中本聪","0x07a75587AFdA3E0BE7913711C2124048dc40A550":"MARK","0x3cFd366e74601BF1DB379912889262e071E8C63a":"Kimi"};

  componentDidMount = async () => {
    try {
      // Get network provider and web3 instance.
      const web3 = await getWeb3();

      // Use web3 to get the user's accounts.
      const accounts = await web3.eth.getAccounts();

      // Get the contract instance.
      const networkId = await web3.eth.net.getId();
      console.log(networkId);
      const deployedNetwork = RecordContract.networks[networkId];
      const instance = new web3.eth.Contract(
        RecordContract.abi,
        deployedNetwork && deployedNetwork.address,
      );

      // Set web3, accounts, and contract to the state, and then proceed with an
      // example of interacting with the contract's methods.
      this.setState({ web3, accounts, contract: instance, network: networkId }, this.runExample);
    } catch (error) {
      // Catch any errors for any of the above operations.
      alert(
        `Failed to load web3, accounts, or contract. Check console for details.`,
      );
      console.error(error);
    }
  };

  runExample = async () => {
    const {  contract } = this.state;
    var response = await contract.methods.owner().call();
    console.log(response);
    // var length = await contract.methods.getLength().call();
    // console.log(length);
    //var res1 = await this.getProposal(1);

    this.setState({
      storageValue: response,
    }, this.getProposal);
    //console.log(this.state.currentProposal);

  };

  getProposal = async () => {
    const {contract} = this.state;
    var length = await contract.methods.getLength().call();
    var a = [];
    for (var i = 0; i < length; i++){
      var b = [];
      var res1 = await contract.methods.allProposals(i).call();
      var _date = new Date(res1.time * 1000);
      var Y = _date.getFullYear() + '-';
   
      var M = (_date.getMonth()+1 < 10 ? '0'+(_date.getMonth()+1) : _date.getMonth()+1) + '-';
  
      var D = _date.getDate() + ' ';
  
      var h = _date.getHours() + ':';
  
      var m = _date.getMinutes() + ':';
  
      var s = _date.getSeconds();
  
      var date = Y+M+D+h+m+s;
  
      //console.log(res1.proposedByWho,res1.tokenName, res1.startPrice, res1.estimatedPrice, res1.time, res1.description);
      b = [res1.proposedByWho,res1.tokenName, res1.startPrice, res1.estimatedPrice, date, res1.description];
      a.push(b);
      //console.log(b)
    }

    this.setState(
      {
        allProposals: a
      }
    )

  }


  /*
    提交input，然后调用addProposal添加新的提议。
  */ 
  handleProposalValueName = async(event) => {
    this.setState({
        name: event.target.value,
    })
  };
 
  handleProposalValueTokenName = async(event) => {
    this.setState({
        tokenName: event.target.value,
    })
  };
  handleProposalValuestartPrice = async(event) => {
    this.setState({
        startPrice: event.target.value,
    })
  };
  handleProposalValueEstimatedPrice = async(event) => {
    this.setState({
        estimatedPrice: event.target.value,
    })
  };
  handleProposalValueDesc = async(event) => {
    this.setState({
        desc: event.target.value,
    })
  };
  handlePost = () =>{
    const {name} = this.state;
    console.log(name);
  }
  addProposal = async() => {
    const {contract} = this.state;
    //console.log(this.state)
    await contract.methods.addProposal(this.state.name,
        this.state.tokenName,
        parseInt(this.state.startPrice),
        parseInt(this.state.estimatedPrice),
        this.state.desc
      ).send({from: this.state.accounts[0]});    
  }


  render() {
    if (!this.state.web3) {
      return <div>Loading Web3, accounts, and contract...</div>;
    }
    console.log(this.state.allProposals);
    var content = this.state.allProposals.map(
      (item, index) => {
        return <tr id={index}>
          {item && item.map(
            (_item, _index) => {
              return <td id={_index}>{_item}</td>
            }
          )
          }
        </tr>
      }
    )
    return (
      <div className="App">
        <div id="header">
        <h1>INVESTMENT RECORD</h1>
        </div>
        <div id="nav">
        <h3>?</h3>
        DASHBOARD<br></br>
        CHARTS<br></br>
        HISTORY<br></br>
        </div>

        <div id="section">
        <h1 id="header">TOKEN</h1>
        <h2 id="header">
          Hi,{this.nameMapping[this.state.accounts]}.
        </h2>
        <h2 id="header">
          Make a suggestion.
        </h2>
        <p>
          <br></br>
          name<input type="text" value={this.state.name} onChange={this.handleProposalValueName}></input>
          <br></br>
          tokenName<input type="text" value={this.state.tokenName} onChange={this.handleProposalValueTokenName}></input>
          <br></br>
          startPrice<input type="text" value={this.state.startPrice} onChange={this.handleProposalValuestartPrice}></input>
          <br></br>
          estimatedPrice<input type="text" value={this.state.estimatedPrice} onChange={this.handleProposalValueEstimatedPrice}></input>
          <br></br>
          desc<input type="text" value={this.state.desc} onChange={this.handleProposalValueDesc}></input>
          <br></br>
          <button onClick={this.addProposal}>提交</button>
        </p>
        <p>
        <table border="5" width="800" height="200">
        <tr>
          <th>NAME</th>
          <th>TOKEN PROPOSED</th>
          <th>START PRICE</th>
          <th>END PRICE</th>
          <th>TIME</th>
          <th>DESC</th>
        </tr>
        {content}


        </table>
        </p>
        </div>

        <div id="footer">
        Copyright GEEKSPIRITS
        </div>

        <div>The final say belongs to geek.</div>
      </div>
    );
  }
}
export default App;
