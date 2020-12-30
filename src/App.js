import React, { Component } from "react";
import RecordContract from "./contracts/Record.json";
import getWeb3 from "./getWeb3";
// import {Table} from 'react-bootstrap';
import { Button, Table,Form,Row,Col, Jumbotron } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
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
    index:null
  };


  componentDidMount = async () => {
    try {
      // Get network provider and web3 instance.
      const web3 = await getWeb3();

      // Use web3 to get the user's accounts.
      const accounts = await web3.eth.getAccounts();

      // Get the contract instance.
      const networkId = await web3.eth.net.getId();
     
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
   
      var M = (_date.getMonth()+1 < 10 ? '0'+(_date.getMonth()+1) : _date.getMonth()+1) + ' ';
  
      var D = _date.getDate() + '/';
  
      var h = _date.getHours() + '';
    
      var date = D+M+h;
  
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
  handleProposalValueIndex = async(event) => {
    this.setState({
        index: event.target.value,
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

  deleteProposal = async() => {
    const {contract, accounts} = this.state;
    if (accounts[0] !== this.state.storageValue){
      alert("You do not have access...");
    } else{
      await contract.methods.deleteByIndex(parseInt(this.state.index)).send({from:this.state.accounts[0]});
    }
  }


  render() {
    if (!this.state.web3) {
      return <div>Loading Web3, accounts, and contract...</div>;
    }
    // console.log(this.state.allProposals);
    var content = this.state.allProposals.reverse().map(
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
      <div className="app">
        <br />
        <Jumbotron>
          <h1>Hello, Work only on Ropsten network!</h1>
          <p>
          Please contact mark if you have any questions.
          </p>
          <br />
        </Jumbotron>

        <Form>
          <Form.Group as={Row} >
            <Form.Label column sm={2} >
              Your Name
            </Form.Label>
            <Col sm={10}>
              <Form.Control type="text" placeholder="Name Exp: Mark"  value={this.state.name} onChange={this.handleProposalValueName}/>
            </Col>
          </Form.Group>

          <Form.Group as={Row} >
            <Form.Label column sm={2}>
              Token Name
            </Form.Label>
            <Col sm={10}>
              <Form.Control type="text" placeholder="Token Name Exp: ETH" value={this.state.tokenName} onChange={this.handleProposalValueTokenName} />
            </Col>
          </Form.Group>

          <Form.Group as={Row} >
            <Form.Label column sm={2}>
              Current Price
            </Form.Label>
            <Col sm={10}>
              <Form.Control type="text" placeholder="Current Price" value={this.state.startPrice} onChange={this.handleProposalValuestartPrice}/>
            </Col>
          </Form.Group>

          <Form.Group as={Row} >
            <Form.Label column sm={2}>
              Target Price
            </Form.Label>
            <Col sm={10}>
              <Form.Control type="text" placeholder="Target Price" value={this.state.estimatedPrice} onChange={this.handleProposalValueEstimatedPrice}/>
            </Col>
          </Form.Group>

          <Form.Group as={Row} >
            <Form.Label column sm={2}>
            Investment reasons
            </Form.Label>
            <Col sm={10}>
              <Form.Control type="text" placeholder="Investment reasons" value={this.state.desc} onChange={this.handleProposalValueDesc} />
            </Col>
          </Form.Group>

          <br />
          <Form.Group as={Row}>
            <Col sm={{ span: 10, offset: 2 }}>
              <Button type="submit" onClick={this.addProposal}>Submit</Button>
            </Col>
          </Form.Group>
        </Form>

        <br />


        <Table striped bordered hover>
          <thead>
            <tr>
              <th scope="col">Name</th>
              <th scope="col">Token</th>
              <th scope="col">Current($)</th>
              <th scope="col">Target($)</th>
              <th scope="col">Submission</th>
              <th scope="col">Investment Reasons</th>
            </tr>
          </thead>
          <tbody>
            {content}
          </tbody>

        </Table>
        <br />
        <Form>
        <Form.Group as={Row} >
            <Form.Label column sm={2}>
              Index
            </Form.Label>
            <Col sm={10}>
              <Form.Control type="text" placeholder="Target Price" value={this.state.estimatedPrice} onChange={this.handleProposalValueIndex}/>
            </Col>
          </Form.Group>
        <br />
        <Form.Group as={Row}>
            <Col sm={{ span: 10, offset: 2 }}>
              <Button type="submit" onClick={this.deleteProposal}>DeleteOnlyByOwner</Button>
            </Col>
          </Form.Group>
        </Form>
        <div id="footer">
        <p>Copyright GEEKSPIRITS</p>
        </div>
      </div>
    );
  }
}
export default App;